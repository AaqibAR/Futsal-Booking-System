const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const mysql = require('mysql2/promise'); 
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3001;

// 🚨 CHANGE THIS IP IF YOU MOVE NETWORKS (Uni/Home)
const CURRENT_IP = "LOCALHOST"; 
const BASE_URL = `http://${CURRENT_IP}:${PORT}`;

app.use(cors());
app.use(express.json());

// ✅ Robust Static File Serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aaqibrasmy24@gmail.com',
        pass: 'pshp hgdi addw tbcr'
    }
});

const sendRealEmail = (to, subject, text) => {
    const mailOptions = {
        from: 'FutsalPro Admin <no-reply@futsalpro.com>',
        to: to,
        subject: subject,
        text: text
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log('❌ Email failed:', error);
    });
};

// --- FILE UPLOAD ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, 'file-' + Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// --- DATABASE CONNECTION ---
const db = mysql.createPool({
    host: 'localhost',
    user: 'aaqib',
    password: '1234',
    database: 'futsal_booking',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection()
    .then(connection => {
        console.log('✅ Connected to MySQL Database');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

// =========================================================
// 1. AUTHENTICATION & USERS
// =========================================================

app.post('/signup', upload.single('document'), async (req, res) => {
    try {
        const { username, email, password, phone, role } = req.body; 
        const status = (role === 'partner') ? 'pending' : 'approved';
        const userRole = role || 'user';
        
        // ✅ Uses BASE_URL variable now
        const documentUrl = req.file ? `${BASE_URL}/uploads/${req.file.filename}` : null;

        const [existing] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        if (existing.length > 0) return res.status(400).json({ message: "Username exists!" });

        const hash = await bcrypt.hash(password, saltRounds);
        
        const insertSql = "INSERT INTO users (username, email, password, phone, role, verification_status, document_url) VALUES (?, ?, ?, ?, ?, ?, ?)";
        await db.query(insertSql, [username, email, hash, phone, userRole, status, documentUrl]);

        if (email && email.includes('@')) {
            const emailMsg = role === 'partner' ? `Hi ${username},\n\nYour Partner account is PENDING APPROVAL.` : `Hi ${username},\n\nWelcome to FutsalPro!`;
            sendRealEmail(email, "Welcome to FutsalPro!", emailMsg);
        }

        res.json({ message: "Registered!" });
    } catch (error) {
        console.error(error); 
        res.status(500).json({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`🔍 Attempting Login for: '${username}'`);

        const [users] = await db.query("SELECT * FROM users WHERE username = ?", [username]);

        if (users.length === 0) return res.status(401).json({ message: "User not found" });

        const user = users[0];

        if (user.role === 'partner' && user.verification_status === 'pending') return res.status(403).json({ message: "Account pending approval." });
        if (user.role === 'partner' && user.verification_status === 'rejected') return res.status(403).json({ message: "Account rejected." });

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.json(user);
        } else {
            res.status(401).json({ message: "Wrong credentials" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/social-login', async (req, res) => {
    try {
        const { email, name } = req.body;
        const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (existing.length > 0) {
            res.json(existing[0]);
        } else {
            const hash = await bcrypt.hash("social_dummy_pass", saltRounds);
            const insertSql = "INSERT INTO users (username, email, password, role, verification_status) VALUES (?, ?, ?, 'user', 'approved')";
            const [result] = await db.query(insertSql, [name || email.split('@')[0], email, hash]);
            res.json({ user_id: result.insertId, username: name, email: email, role: 'user' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/users/:id', upload.single('profile_pic'), async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, email, phone } = req.body;
        let sql, params;

        if (req.file) {
            // ✅ Uses BASE_URL variable now
            const profileUrl = `${BASE_URL}/uploads/${req.file.filename}`;
            sql = "UPDATE users SET username = ?, email = ?, phone = ?, profile_picture = ? WHERE user_id = ?";
            params = [username, email, phone, profileUrl, userId];
        } else {
            sql = "UPDATE users SET username = ?, email = ?, phone = ? WHERE user_id = ?";
            params = [username, email, phone, userId];
        }

        await db.query(sql, params);
        res.json({ message: "Profile Updated", ...req.body, profile_picture: req.file ? `${BASE_URL}/uploads/${req.file.filename}` : undefined });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =========================================================
// 2. COURTS & MAINTENANCE
// =========================================================

app.get('/courts', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM courts");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/courts', upload.single('image'), async (req, res) => {
    try {
        const { name, location, price, owner_id } = req.body;
        // ✅ Uses BASE_URL variable now
        const imageUrl = req.file ? `${BASE_URL}/uploads/${req.file.filename}` : req.body.image_url;
        await db.query("INSERT INTO courts (name, location, price, image_url, owner_id) VALUES (?, ?, ?, ?, ?)", [name, location, price, imageUrl, owner_id]);
        res.json({ message: "Facility Added" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/courts/:id', async (req, res) => {
    try {
        const { name, location, price } = req.body;
        await db.query("UPDATE courts SET name=?, location=?, price=? WHERE court_id=?", [name, location, price, req.params.id]);
        res.json({ message: "Updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/courts/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM courts WHERE court_id=?", [req.params.id]);
        res.json({ message: "Deleted" });
    } catch (error) {
        res.status(500).json({ error: "Cannot delete active court" });
    }
});

app.post('/maintenance', async (req, res) => {
    try {
        const { court_id, startDate, endDate, reason } = req.body;
        const getDatesInRange = (start, end) => {
            let date = new Date(start);
            const endDt = new Date(end);
            const dates = [];
            while (date <= endDt) {
                const offset = date.getTimezoneOffset();
                const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                dates.push(localDate.toISOString().split('T')[0]);
                date.setDate(date.getDate() + 1);
            }
            return dates;
        };
        const datesToBlock = getDatesInRange(startDate, endDate);
        const [bookings] = await db.query("SELECT * FROM bookings WHERE court_id = ? AND status='confirmed'", [court_id]);
        const hasConflict = bookings.some(b => datesToBlock.includes(new Date(b.booking_date).toISOString().split('T')[0]));

        if (hasConflict) return res.status(400).json({ error: "Active bookings exist in this range." });

        const values = datesToBlock.map(date => [court_id, date, reason]);
        await db.query("INSERT INTO maintenance (court_id, date, reason) VALUES ?", [values]);
        res.json({ message: `Blocked ${datesToBlock.length} days.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/maintenance/:courtId', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, date, reason FROM maintenance WHERE court_id = ? ORDER BY date ASC", [req.params.courtId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/maintenance/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM maintenance WHERE id = ?", [req.params.id]);
        res.json({ message: "Unblocked successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =========================================================
// 3. BOOKINGS & COMMISSIONS
// =========================================================

app.post('/check-availability', async (req, res) => {
    try {
        const { court_id, date, time } = req.body;
        const [maintRes] = await db.query("SELECT * FROM maintenance WHERE court_id = ? AND date = ?", [court_id, date]);
        if (maintRes.length > 0) return res.json({ available: false });

        const [bookings] = await db.query("SELECT * FROM bookings WHERE court_id = ? AND booking_date = ? AND time_slot = ? AND status = 'confirmed'", [court_id, date, time]);
        res.json({ available: bookings.length === 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/book', async (req, res) => {
try {
    const { user_id, court_id, date, time, price } = req.body;

    const [existing] = await db.query("SELECT * FROM bookings WHERE court_id = ? AND booking_date = ? AND time_slot = ? AND status = 'confirmed'", [court_id, date, time]);
    if (existing.length > 0) return res.status(409).json({ error: "Slot already taken." });

    const [result] = await db.query("INSERT INTO bookings (user_id, court_id, booking_date, time_slot, status) VALUES (?, ?, ?, ?, 'confirmed')", [user_id, court_id, date, time]);
    const bookingId = result.insertId;

    const [courtData] = await db.query("SELECT owner_id, price FROM courts WHERE court_id = ?", [court_id]);
    const ownerId = courtData[0].owner_id;
    const finalPrice = price || courtData[0].price; 

    const [ownerData] = await db.query("SELECT commission_rate FROM users WHERE user_id = ?", [ownerId]);
    const rate = ownerData[0].commission_rate || 10; 

    const platformFee = finalPrice * (rate / 100);
    const vendorNet = finalPrice - platformFee;

    await db.query("INSERT INTO payments (booking_id, amount, platform_fee, vendor_net, method, status) VALUES (?, ?, ?, ?, 'card', 'paid')", [bookingId, finalPrice, platformFee, vendorNet]);

    const [userRes] = await db.query("SELECT email FROM users WHERE user_id = ?", [user_id]);
    if (userRes.length > 0) sendRealEmail(userRes[0].email, "Booking Confirmed ✅", `Booking #${bookingId} Confirmed!\nDate: ${date}\nTime: ${time}`);

    res.json({ message: "Booking Successful!" });
} catch (error) {
    res.status(500).json({ error: error.message });
}
});

app.post('/bookings/cancel', async (req, res) => {
    try {
        const { booking_id, user_id } = req.body;
        const [payRes] = await db.query("SELECT amount FROM payments WHERE booking_id = ?", [booking_id]);
        const refundAmount = (payRes.length > 0) ? payRes[0].amount : 0;

        await db.query("UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?", [booking_id]);
        await db.query("INSERT INTO refunds (booking_id, user_id, amount, status) VALUES (?, ?, ?, 'pending')", [booking_id, user_id, refundAmount]);

        const [userRes] = await db.query("SELECT email FROM users WHERE user_id = ?", [user_id]);
        if (userRes.length > 0) sendRealEmail(userRes[0].email, "Booking Cancelled ❌", `Booking #${booking_id} Cancelled. Refund LKR ${refundAmount} initiated.`);

        await db.query("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, 'email')", [user_id, `Booking #${booking_id} Cancelled. Refund LKR ${refundAmount} initiated.`]);
        res.json({ message: "Cancelled & Refund Requested" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/my-bookings/:userId', async (req, res) => {
    try {
        const sql = `SELECT b.booking_id, b.court_id, DATE_FORMAT(b.booking_date, '%Y-%m-%d') as booking_date, b.time_slot, b.status, c.name, c.location, c.price, c.image_url FROM bookings b JOIN courts c ON b.court_id = c.court_id WHERE b.user_id = ? ORDER BY b.booking_date DESC`;
        const [rows] = await db.query(sql, [req.params.userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/bookings/all', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT court_id, DATE_FORMAT(booking_date, '%Y-%m-%d') as booking_date, time_slot FROM bookings WHERE status = 'confirmed'");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/my-refunds/:userId', async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT r.refund_id, r.amount, r.status, r.requested_at, c.name as court_name FROM refunds r JOIN bookings b ON r.booking_id = b.booking_id JOIN courts c ON b.court_id = c.court_id WHERE r.user_id = ? ORDER BY r.requested_at DESC`, [req.params.userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// =========================================================
// 4. ADMIN & SUPER ADMIN
// =========================================================

app.get('/admin/stats', async (req, res) => {
try {
    const userId = req.query.userId;
    const [userRes] = await db.query("SELECT role FROM users WHERE user_id = ?", [userId]);

    if (userRes.length === 0) return res.status(404).json({ error: "User not found" });
    const userRole = userRes[0].role;

    if (userRole === 'admin') {
        const sqlRevenue = "SELECT IFNULL(SUM(platform_fee), 0) as total_revenue FROM payments";
        const sqlBookings = "SELECT COUNT(*) as total_bookings FROM bookings WHERE status = 'confirmed'";
        const sqlPartners = "SELECT COUNT(*) as count FROM users WHERE role = 'partner'";
        const sqlPlayers = "SELECT COUNT(*) as count FROM users WHERE role = 'user'";
        const sqlTopCourt = `
            SELECT c.name, COUNT(b.booking_id) as booking_count 
            FROM bookings b 
            JOIN courts c ON b.court_id = c.court_id 
            WHERE b.status = 'confirmed' 
            GROUP BY c.court_id 
            ORDER BY booking_count DESC 
            LIMIT 1
        `;

        const [rev] = await db.query(sqlRevenue);
        const [book] = await db.query(sqlBookings);
        const [part] = await db.query(sqlPartners);
        const [play] = await db.query(sqlPlayers);
        const [top] = await db.query(sqlTopCourt);

        return res.json({
            revenue: rev[0].total_revenue,
            bookings: book[0].total_bookings,
            total_partners: part[0].count,
            total_players: play[0].count,
            top_court: top.length > 0 ? top[0] : null
        });
    }

    else {
        const sqlBookings = "SELECT COUNT(*) as bookings FROM bookings b JOIN courts c ON b.court_id = c.court_id WHERE c.owner_id = ?";
        const sqlRevenue = "SELECT IFNULL(SUM(vendor_net), 0) as revenue FROM payments p JOIN bookings b ON p.booking_id = b.booking_id JOIN courts c ON b.court_id = c.court_id WHERE c.owner_id = ?";
        const sqlCourts = "SELECT COUNT(*) as courts FROM courts WHERE owner_id = ?";

        const [d1] = await db.query(sqlBookings, [userId]);
        const [d2] = await db.query(sqlRevenue, [userId]);
        const [d3] = await db.query(sqlCourts, [userId]);

        return res.json({
            bookings: d1 ? d1[0].bookings : 0,
            revenue: d2 ? d2[0].revenue : 0,
            courts: d3 ? d3[0].courts : 0
        });
    }

} catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
}
});

app.get('/admin/pending-partners', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT user_id, username, email, phone, created_at, document_url FROM users WHERE role = 'partner' AND verification_status = 'pending'");
        res.json(rows);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.put('/admin/verify-user/:id', async (req, res) => {
    try {
        await db.query("UPDATE users SET verification_status = ? WHERE user_id = ?", [req.body.status, req.params.id]);
        res.json({ message: `Partner ${req.body.status} successfully.` });
    } catch (error) {
        res.status(500).json(error);
    }
});

app.get('/admin/bookings', async (req, res) => {
    try {
        const ownerId = req.query.userId;
        const sql = `SELECT b.booking_id, u.username, c.name as court_name, DATE_FORMAT(b.booking_date, '%Y-%m-%d') as booking_date, b.time_slot, c.price, b.status FROM bookings b JOIN users u ON b.user_id = u.user_id JOIN courts c ON b.court_id = c.court_id WHERE c.owner_id = ? ORDER BY b.booking_date DESC`;
        const [rows] = await db.query(sql, [ownerId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.get('/admin/refunds', async (req, res) => {
    try {
        const ownerId = req.query.userId;
        const sql = `SELECT r.refund_id, r.amount, r.requested_at, u.username, c.name as court_name FROM refunds r JOIN bookings b ON r.booking_id = b.booking_id JOIN courts c ON b.court_id = c.court_id JOIN users u ON r.user_id = u.user_id WHERE c.owner_id = ? AND r.status = 'pending'`;
        const [rows] = await db.query(sql, [ownerId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.put('/admin/refunds/:id', async (req, res) => {
    try {
        await db.query("UPDATE refunds SET status = ? WHERE refund_id = ?", [req.body.status, req.params.id]);
        res.json({ message: "Updated" });
    } catch (error) {
        res.status(500).json(error);
    }
});

app.get('/admin/my-courts', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM courts WHERE owner_id = ?", [req.query.userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.get('/admin/active-partners', async (req, res) => {
try {
    const [rows] = await db.query("SELECT user_id, username, email, phone, commission_rate FROM users WHERE role = 'partner' AND verification_status = 'approved'");
    res.json(rows);
} catch (error) {
    res.status(500).json(error);
}
});

app.put('/admin/update-rate/:id', async (req, res) => {
try {
    const { commission_rate } = req.body;
    await db.query("UPDATE users SET commission_rate = ? WHERE user_id = ?", [commission_rate, req.params.id]);
    res.json({ message: "Commission rate updated" });
} catch (error) {
    res.status(500).json(error);
}
});

app.get('/notifications/:userId', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [req.params.userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.get('/admin/chart-data', async (req, res) => {
try {
   const period = req.query.period || 'monthly'; 
   let sql;

   if (period === 'yearly') {
       sql = `
        SELECT 
            DATE_FORMAT(b.booking_date, '%Y') as name, 
            SUM(p.platform_fee) as revenue, 
            COUNT(p.payment_id) as bookings
        FROM payments p
        JOIN bookings b ON p.booking_id = b.booking_id
        WHERE b.status = 'confirmed'
        GROUP BY name
        ORDER BY name ASC;
       `;
   } else if (period === 'weekly') {
       sql = `
        SELECT 
            DATE_FORMAT(b.booking_date, 'W%v %Y') as name, 
            SUM(p.platform_fee) as revenue, 
            COUNT(p.payment_id) as bookings
        FROM payments p
        JOIN bookings b ON p.booking_id = b.booking_id
        WHERE b.status = 'confirmed'
        GROUP BY YEARWEEK(b.booking_date, 1), name
        ORDER BY YEARWEEK(b.booking_date, 1) ASC
        LIMIT 12;
       `;
   } else {
       sql = `
        SELECT 
            DATE_FORMAT(b.booking_date, '%b %Y') as name, 
            SUM(p.platform_fee) as revenue, 
            COUNT(p.payment_id) as bookings
        FROM payments p
        JOIN bookings b ON p.booking_id = b.booking_id
        WHERE b.status = 'confirmed'
        GROUP BY DATE_FORMAT(b.booking_date, '%Y-%m'), name
        ORDER BY DATE_FORMAT(b.booking_date, '%Y-%m') ASC
        LIMIT 12;
       `;
   }

   const [data] = await db.query(sql);
   res.json(data);
} catch (error) {
    res.status(500).json(error);
}
});

app.get('/admin/users', async (req, res) => {
try {
    const [users] = await db.query("SELECT user_id, username, email, role, verification_status FROM users WHERE role != 'admin' ORDER BY created_at DESC");
    res.json(users);
} catch (error) {
    res.status(500).json(error);
}
});

app.delete('/admin/users/:id', async (req, res) => {
try {
    await db.query("DELETE FROM users WHERE user_id = ?", [req.params.id]);
    res.json({ message: "User permanently removed." });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Cannot delete user. They may have active bookings/courts." });
}
});

app.get('/admin/peak-hours', async (req, res) => {
try {
    const sql = `
        SELECT time_slot as name, COUNT(*) as bookings
        FROM bookings
        WHERE status = 'confirmed'
        GROUP BY time_slot
        ORDER BY time_slot ASC; 
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
} catch (error) {
    res.status(500).json(error);
}
});

app.post('/reviews', async (req, res) => {
    try {
        await db.query("INSERT INTO reviews (court_id, user_id, rating, comment) VALUES (?, ?, ?, ?)", [req.body.court_id, req.body.user_id, req.body.rating, req.body.comment]);
        res.json({ message: "Review Added" });
    } catch (error) {
        res.status(500).json(error);
    }
});

app.post('/bookings/reschedule', async (req, res) => {
    try {
        const { booking_id, court_id, date, time } = req.body;
        const [existing] = await db.query("SELECT * FROM bookings WHERE court_id = ? AND booking_date = ? AND time_slot = ? AND booking_id != ? AND status = 'confirmed'", [court_id, date, time, booking_id]);

        if (existing.length > 0) return res.status(409).json({ message: "Slot unavailable" });

        await db.query("UPDATE bookings SET booking_date = ?, time_slot = ? WHERE booking_id = ?", [date, time, booking_id]);
        res.json({ message: "Reschedule Successful" });
    } catch (error) {
        res.status(500).json(error);
    }
});

app.get('/create-admin', async (req, res) => {
    try {
        const hash = await bcrypt.hash("password123", 10);
        await db.query("DELETE FROM users WHERE username = 'admin'");
        await db.query(
            "INSERT INTO users (username, email, password, role, verification_status) VALUES (?, ?, ?, ?, ?)",
            ['admin', 'admin@futsalpro.com', hash, 'admin', 'approved']
        );
        res.send("✅ Admin Account Restored! Username: admin | Password: password123");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// ... existing imports
const PDFDocument = require('pdfkit'); // ✅ Import PDFKit

// ... existing code ...

// ✅ NEW: Generate PDF Invoice Route
app.get('/admin/generate-invoice', async (req, res) => {
    try {
        const userId = req.query.userId;
        const month = new Date().toLocaleString('default', { month: 'long' }); // e.g., "January"
        const year = new Date().getFullYear();

        // 1. Fetch Partner Details
        const [userRes] = await db.query("SELECT username, email FROM users WHERE user_id = ?", [userId]);
        const partner = userRes[0];

        // 2. Fetch Earnings Data for this Partner
        // We join payments -> bookings -> courts to filter by owner_id
        const sql = `
            SELECT 
                b.booking_id, 
                c.name as court_name, 
                DATE_FORMAT(b.booking_date, '%Y-%m-%d') as date, 
                p.vendor_net as amount 
            FROM payments p
            JOIN bookings b ON p.booking_id = b.booking_id
            JOIN courts c ON b.court_id = c.court_id
            WHERE c.owner_id = ? AND p.status = 'paid'
        `;
        const [transactions] = await db.query(sql, [userId]);

        // Calculate Total
        const totalEarnings = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

        // 3. Generate PDF
        const doc = new PDFDocument({ margin: 50 });

        // Stream PDF to the browser (Client will download it)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${month}_${year}.pdf`);
        doc.pipe(res);

        // --- PDF DESIGN ---
        
        // Header
        doc.fontSize(20).text('FutsalPro Monthly Earnings', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Partner: ${partner.username}`);
        doc.text(`Email: ${partner.email}`);
        doc.text(`Period: ${month} ${year}`);
        doc.moveDown();
        doc.text(`Generated on: ${new Date().toDateString()}`);
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Line divider
        doc.moveDown();

        // Table Header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Booking ID', 50, tableTop);
        doc.text('Facility', 150, tableTop);
        doc.text('Date', 350, tableTop);
        doc.text('Net Earnings (LKR)', 450, tableTop, { align: 'right' });
        doc.font('Helvetica');
        doc.moveDown();

        // Table Rows
        let yPosition = tableTop + 25;
        transactions.forEach((t) => {
            if (yPosition > 700) { // Add new page if list is long
                doc.addPage();
                yPosition = 50;
            }

            doc.text(`#${t.booking_id}`, 50, yPosition);
            doc.text(t.court_name, 150, yPosition);
            doc.text(t.date, 350, yPosition);
            doc.text(t.amount.toLocaleString(), 450, yPosition, { align: 'right' });
            
            yPosition += 20;
        });

        doc.moveDown();
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke(); // Line divider
        
        // Total
        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(16).fillColor('#00C853');
        doc.text(`Total Payout: LKR ${totalEarnings.toLocaleString()}`, { align: 'right' });

        // Footer
        doc.fillColor('black').fontSize(10);
        doc.text('Thank you for partnering with FutsalPro.', 50, 700, { align: 'center', width: 500 });

        doc.end(); // Finish PDF

    } catch (error) {
        console.error(error);
        res.status(500).send("Error generating invoice");
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));