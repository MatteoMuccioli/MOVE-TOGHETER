/* ============================================================
   MOVE TOGETHER – Server v3
   Node.js / Express · JWT Auth · bcryptjs · Nodemailer
   ============================================================ */
require('dotenv').config();
const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const fs         = require('fs');
const path       = require('path');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');

const app  = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET  = process.env.JWT_SECRET  || 'mt25-secret-change-in-production';
const JWT_EXPIRES = '7d';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ══════════════════════════════════════════════
   FILE STORAGE
   ══════════════════════════════════════════════ */
const DATA_DIR = path.join(__dirname, 'data');
const UTENTI_F = path.join(DATA_DIR, 'utenti.json');
const COUPON_F = path.join(DATA_DIR, 'coupon.json');
const PREN_F   = path.join(__dirname, 'prenotazioni.json'); // legacy compat

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJSON(file, fallback = []) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch (_) { return fallback; }
}
function writeJSON(file, data) {
    try { fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8'); return true; }
    catch (e) { console.error('writeJSON:', e.message); return false; }
}

/* ══════════════════════════════════════════════
   HELPERS & SHARED DATA
   ══════════════════════════════════════════════ */
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function genCode() {
    const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const r4 = () => Array.from({ length: 4 }, () => c[Math.floor(Math.random() * c.length)]).join('');
    return `MT25-${r4()}-${r4()}`;
}

function classifyAge(age) {
    age = parseInt(age);
    if (age >= 16 && age <= 20) return 'Giovane (16-20)';
    if (age >= 60)               return 'Over 60';
    return 'Altro';
}

const CHALLENGES = [
    { id:1, title:'10.000 Passi Condivisi',          xp:150, badge:'🚶', badgeName:'Camminatore',  difficulty:'Facile',    diffColor:'#10B981', icon:'fa-walking',    description:'Cammina 10.000 passi insieme a un Over 60. Documenta il percorso con una foto.' },
    { id:2, title:"Insegna un'App Tech a un Senior", xp:200, badge:'📱', badgeName:'Tech Mentor',  difficulty:'Media',     diffColor:'#F59E0B', icon:'fa-mobile-alt', description:"Mostra a un Over 60 come usare un fitness tracker o l'app Move Together." },
    { id:3, title:'Sessione Stretching Condivisa',   xp:120, badge:'🧘', badgeName:'Zen Master',   difficulty:'Facile',    diffColor:'#10B981', icon:'fa-spa',        description:'30 minuti di stretching o yoga con un Over 60 del tuo centro.' },
    { id:4, title:'Sfida dei 30 Giorni',             xp:500, badge:'🔥', badgeName:'Fuoco Sacro',  difficulty:'Difficile', diffColor:'#EF4444', icon:'fa-fire',       description:'30 giorni consecutivi di allenamento, almeno 2 sessioni in coppia a settimana.' },
    { id:5, title:'Ricetta Sana Intergenerazionale', xp:100, badge:'🍎', badgeName:'Chef Salute',  difficulty:'Facile',    diffColor:'#10B981', icon:'fa-utensils',   description:'Prepara un pasto salutare con un Senior e condividi la ricetta nella community.' },
    { id:6, title:'Porta un Amico al Move Together', xp:250, badge:'🤝', badgeName:'Ambasciatore', difficulty:'Media',     diffColor:'#F59E0B', icon:'fa-user-plus',  description:"Invita un amico all'Open Day. Se si iscrive, entrambi ricevete un mese gratis." }
];

const XP_LEVELS = [
    { level:1, name:'Principiante', minXP:0    },
    { level:2, name:'Allenato',     minXP:200  },
    { level:3, name:'Campione',     minXP:500  },
    { level:4, name:'Leggenda',     minXP:1000 }
];

function getLevel(xp) {
    return [...XP_LEVELS].reverse().find(l => xp >= l.minXP) || XP_LEVELS[0];
}

/* ══════════════════════════════════════════════
   MIDDLEWARE
   ══════════════════════════════════════════════ */
function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Non autenticato' });
    try { req.user = jwt.verify(header.slice(7), JWT_SECRET); next(); }
    catch { res.status(401).json({ error: 'Token non valido o scaduto' }); }
}

function adminMiddleware(req, res, next) {
    const secret = req.headers['x-admin-secret'] || req.query.secret;
    if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET)
        return res.status(401).json({ error: 'Accesso negato' });
    next();
}

/* ══════════════════════════════════════════════
   NODEMAILER
   ══════════════════════════════════════════════ */
function createTransporter() {
    const svc = (process.env.EMAIL_SERVICE || '').toLowerCase();
    if (svc === 'gmail' && process.env.EMAIL_USER && process.env.EMAIL_PASS)
        return nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
    if (svc === 'sendgrid' && process.env.SENDGRID_API_KEY)
        return nodemailer.createTransport({ host: 'smtp.sendgrid.net', port: 587, auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY } });
    if (svc === 'mailgun' && process.env.MAILGUN_USER && process.env.MAILGUN_PASS)
        return nodemailer.createTransport({ host: process.env.MAILGUN_SMTP_HOST || 'smtp.mailgun.org', port: 587, auth: { user: process.env.MAILGUN_USER, pass: process.env.MAILGUN_PASS } });
    return null;
}

async function sendEmail(to, subject, html) {
    const t = createTransporter();
    if (!t) return false;
    try { await t.sendMail({ from: `"Move Together ANIF" <${process.env.EMAIL_USER}>`, to, subject, html }); return true; }
    catch (e) { console.error('Email error:', e.message); return false; }
}

/* ══════════════════════════════════════════════
   AUTH ROUTES
   ══════════════════════════════════════════════ */

app.post('/api/auth/register', async (req, res) => {
    try {
        const { nome, email, password, eta, gymId, gymName } = req.body;
        if (!nome || !email || !password || !eta)
            return res.status(400).json({ error: 'Campi obbligatori mancanti.' });
        if (password.length < 6)
            return res.status(400).json({ error: 'Password di almeno 6 caratteri.' });

        const utenti = readJSON(UTENTI_F);
        if (utenti.find(u => u.email.toLowerCase() === email.toLowerCase().trim()))
            return res.status(409).json({ error: 'Email già registrata. Accedi.' });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = {
            id:              genId(),
            nome:            nome.trim(),
            email:           email.toLowerCase().trim(),
            passwordHash,
            eta:             parseInt(eta),
            fasciaEta:       classifyAge(eta),
            gymId:           gymId   || null,
            gymName:         gymName || null,
            punti:           0,
            livello:         1,
            sfideCompletate: [],
            badges:          ['🏃 Primo Passo'],
            createdAt:       new Date().toISOString()
        };

        utenti.push(user);
        writeJSON(UTENTI_F, utenti);
        sendEmail(email, 'Benvenuto in Move Together! 🏃', buildWelcomeEmail(user)).catch(() => {});

        const token = jwt.sign({ id: user.id, email: user.email, nome: user.nome }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        const { passwordHash: _, ...safe } = user;
        res.json({ success: true, token, user: safe });
    } catch (err) { console.error('register:', err); res.status(500).json({ error: 'Errore del server.' }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email e password richieste.' });

        const utenti = readJSON(UTENTI_F);
        const user   = utenti.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

        if (!user || !(await bcrypt.compare(password, user.passwordHash)))
            return res.status(401).json({ error: 'Email o password non corretti.' });

        const token = jwt.sign({ id: user.id, email: user.email, nome: user.nome }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        const { passwordHash: _, ...safe } = user;
        res.json({ success: true, token, user: safe });
    } catch (err) { console.error('login:', err); res.status(500).json({ error: 'Errore del server.' }); }
});

/* ══════════════════════════════════════════════
   USER ROUTES  (JWT required)
   ══════════════════════════════════════════════ */

app.get('/api/user/me', authMiddleware, (req, res) => {
    const user = readJSON(UTENTI_F).find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'Utente non trovato.' });
    const { passwordHash: _, ...safe } = user;
    const lvInfo = getLevel(user.punti);
    const nextLv = XP_LEVELS.find(l => l.level === lvInfo.level + 1);
    res.json({ ...safe, livelloInfo: lvInfo, nextLevelXP: nextLv?.minXP || null, xpToNext: nextLv ? nextLv.minXP - user.punti : 0 });
});

app.get('/api/user/challenges', authMiddleware, (req, res) => {
    const user = readJSON(UTENTI_F).find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'Utente non trovato.' });
    const lvInfo = getLevel(user.punti);
    const nextLv = XP_LEVELS.find(l => l.level === lvInfo.level + 1);
    res.json({
        challenges:  CHALLENGES.map(ch => ({ ...ch, completata: (user.sfideCompletate || []).includes(ch.id) })),
        puntiTotali: user.punti,
        livello:     lvInfo,
        xpToNext:    nextLv ? nextLv.minXP - user.punti : 0
    });
});

app.post('/api/user/complete-challenge', authMiddleware, (req, res) => {
    const { challengeId } = req.body;
    const ch = CHALLENGES.find(c => c.id === parseInt(challengeId));
    if (!ch) return res.status(400).json({ error: 'Sfida non trovata.' });

    const utenti = readJSON(UTENTI_F);
    const idx    = utenti.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'Utente non trovato.' });

    const user = utenti[idx];
    if ((user.sfideCompletate || []).includes(ch.id))
        return res.status(409).json({ error: 'Sfida già completata.' });

    user.sfideCompletate = [...(user.sfideCompletate || []), ch.id];
    user.punti   = (user.punti || 0) + ch.xp;
    user.badges  = [...(user.badges || []), `${ch.badge} ${ch.badgeName}`];
    user.livello = getLevel(user.punti).level;
    utenti[idx]  = user;
    writeJSON(UTENTI_F, utenti);

    const lvInfo = getLevel(user.punti);
    const nextLv = XP_LEVELS.find(l => l.level === lvInfo.level + 1);
    const { passwordHash: _, ...safe } = user;
    res.json({ success: true, xpGuadagnati: ch.xp, badge: `${ch.badge} ${ch.badgeName}`, puntiTotali: user.punti, livello: lvInfo, xpToNext: nextLv ? nextLv.minXP - user.punti : 0, user: safe });
});

app.get('/api/user/coupons', authMiddleware, (req, res) => {
    const now      = new Date();
    const scadenza = new Date('2026-12-31T23:59:59');
    const mapped   = readJSON(COUPON_F)
        .filter(c => c.userId === req.user.id)
        .map(c => ({ ...c, stato: c.stato === 'Usato' ? 'Usato' : (now > scadenza ? 'Scaduto' : 'Attivo') }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(mapped);
});

app.get('/api/user/buddy', authMiddleware, (req, res) => {
    const utenti = readJSON(UTENTI_F);
    const me = utenti.find(u => u.id === req.user.id);
    if (!me) return res.status(404).json({ error: 'Utente non trovato.' });

    const targetFascia = me.fasciaEta === 'Giovane (16-20)' ? 'Over 60' : 'Giovane (16-20)';
    const buddies = utenti
        .filter(u => u.id !== me.id && u.fasciaEta === targetFascia)
        .sort((a, b) => (b.gymId === me.gymId ? 1 : 0) - (a.gymId === me.gymId ? 1 : 0))
        .slice(0, 3)
        .map(u => ({
            id: u.id, nome: u.nome, iniziale: u.nome.charAt(0).toUpperCase(),
            fasciaEta: u.fasciaEta, gymName: u.gymName || 'Sede ANIF',
            stessaGym: u.gymId === me.gymId, punti: u.punti || 0,
            livello: getLevel(u.punti || 0).name, sfide: (u.sfideCompletate || []).length
        }));
    res.json(buddies);
});

/* ══════════════════════════════════════════════
   PRENOTA  (funziona con o senza auth)
   ══════════════════════════════════════════════ */

app.post('/api/prenota', async (req, res) => {
    try {
        const { name, age, email, gymId, gymName, gymAddress, offer } = req.body;
        if (!name || !age || !email || !gymId || !offer)
            return res.status(400).json({ success: false, message: 'Campi obbligatori mancanti.' });

        const code = genCode(), ageGroup = classifyAge(age);
        const gymN = gymName || gymId, gymA = gymAddress || '';

        let userId = null;
        const ah = req.headers.authorization;
        if (ah?.startsWith('Bearer ')) try { userId = jwt.verify(ah.slice(7), JWT_SECRET).id; } catch (_) {}

        const coupon = {
            id: genId(), userId, userName: name, userEmail: email, age: parseInt(age), ageGroup, code,
            offerta: offer, gymId, gymName: gymN, gymAddress: gymA, stato: 'Attivo',
            createdAt: new Date().toISOString(), usedAt: null
        };
        const coupons = readJSON(COUPON_F); coupons.push(coupon); writeJSON(COUPON_F, coupons);
        const pren = readJSON(PREN_F); pren.push({ ...coupon, name, timestamp: coupon.createdAt }); writeJSON(PREN_F, pren);

        const ed = { name, age, email, ageGroup, gymName: gymN, gymAddress: gymA, offer, code };
        // Fire-and-forget: non blocca la risposta HTTP
        sendEmail(email, `Il tuo Coupon Move Together – ${code}`, buildUserEmail(ed)).catch(() => {});
        if (process.env.ANIF_EMAIL) sendEmail(process.env.ANIF_EMAIL, `Nuova Prenotazione – ${name}`, buildAdminEmail(ed)).catch(() => {});
        const emailSent = true;

        res.json({ success: true, code, ageGroup, gymName: gymN, gymAddress: gymA, emailSent, message: 'Prenotazione confermata!' });
    } catch (err) { console.error('prenota:', err); res.status(500).json({ success: false, message: 'Errore del server.' }); }
});

/* ══════════════════════════════════════════════
   STATUS
   ══════════════════════════════════════════════ */

app.get('/api/status', (req, res) => {
    res.json({
        status: 'online', app: 'Move Together v3', timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()), totalBookings: readJSON(COUPON_F).length,
        totalUsers: readJSON(UTENTI_F).length, nodeVersion: process.version
    });
});

/* ══════════════════════════════════════════════
   ADMIN ROUTES
   ══════════════════════════════════════════════ */

app.get('/api/admin/stats', adminMiddleware, (req, res) => {
    const coupons = readJSON(COUPON_F), utenti = readJSON(UTENTI_F);

    const giovani = coupons.filter(c => c.ageGroup === 'Giovane (16-20)').length;
    const senior  = coupons.filter(c => c.ageGroup === 'Over 60').length;
    const altri   = coupons.filter(c => !['Giovane (16-20)', 'Over 60'].includes(c.ageGroup)).length;
    const interGeno = coupons.filter(c => /(intergener|pilates)/i.test(c.offerta || '')).length;

    const byOffer = {};
    coupons.forEach(c => { byOffer[c.offerta || 'Altro'] = (byOffer[c.offerta || 'Altro'] || 0) + 1; });

    const byGym = {};
    coupons.forEach(c => { const k = c.gymName || c.gymId || 'N/D'; byGym[k] = (byGym[k] || 0) + 1; });
    const byGymArr = Object.entries(byGym).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));

    const byDay = {};
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); byDay[d.toISOString().slice(0, 10)] = 0; }
    coupons.forEach(c => { const day = (c.createdAt || '').slice(0, 10); if (byDay[day] !== undefined) byDay[day]++; });

    const totalUsers  = utenti.length;
    const userGiovani = utenti.filter(u => u.fasciaEta === 'Giovane (16-20)').length;
    const userSenior  = utenti.filter(u => u.fasciaEta === 'Over 60').length;

    const challengeStats = CHALLENGES.map(ch => ({
        id: ch.id, title: ch.title, badge: ch.badge, xp: ch.xp,
        difficulty: ch.difficulty, icon: ch.icon,
        completamenti: utenti.filter(u => (u.sfideCompletate || []).includes(ch.id)).length
    }));

    res.json({
        total: coupons.length, giovani, senior, altri, intergenerazionali: interGeno,
        byOffer, byGym: byGymArr, byDay, recentBookings: coupons.slice(-25).reverse(),
        totalUsers, userGiovani, userSenior, challengeStats,
        recentUsers: utenti.slice(-10).reverse().map(({ passwordHash: _, ...u }) => u)
    });
});

app.get('/api/admin/export', adminMiddleware, (req, res) => {
    const coupons = readJSON(COUPON_F), utenti = readJSON(UTENTI_F);
    const headers = ['ID','Nome','Email','Età','Fascia','Offerta','Sede','Indirizzo','Codice','Stato','Data'];
    const rows = coupons.map(c => {
        const u = utenti.find(u => u.id === c.userId);
        return [c.id, c.userName, c.userEmail, c.age || u?.eta || '', c.ageGroup || '',
            c.offerta || '', c.gymName || '', c.gymAddress || '', c.code || '', c.stato || 'Attivo',
            new Date(c.createdAt).toLocaleString('it-IT')
        ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(',');
    });
    const ts = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="movetogether_export_${ts}.csv"`);
    res.send('﻿' + [headers.join(','), ...rows].join('\r\n'));
});

/* ══════════════════════════════════════════════
   EMAIL TEMPLATES
   ══════════════════════════════════════════════ */

function buildWelcomeEmail(user) {
    const c = user.fasciaEta === 'Over 60' ? '#1F6B52' : '#FF6B35';
    return `<div style="font-family:'Inter',sans-serif;max-width:560px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#FF6B35,#FF8A5B);padding:32px;text-align:center;color:white;border-radius:16px 16px 0 0;">
            <div style="font-size:2.5rem;">🏃</div>
            <h1 style="font-weight:900;font-size:1.8rem;margin:10px 0 0;">Benvenuto in Move Together!</h1>
        </div>
        <div style="background:white;padding:32px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;">
            <p>Ciao <strong>${user.nome}</strong>, il tuo account è attivo!</p>
            <p>Sei nella fascia <strong style="color:${c}">${user.fasciaEta}</strong>. Accedi alla tua area riservata per completare le sfide, guadagnare XP e trovare il tuo Gym Buddy!</p>
            <div style="text-align:center;margin:28px 0;">
                <a href="${process.env.APP_URL || ''}/dashboard.html" style="background:#FF6B35;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;display:inline-block;">Vai alla tua Dashboard →</a>
            </div>
            <p style="color:#9CA3AF;font-size:12px;text-align:center;">Move Together · ANIF Eurowellness · RiminiWellness 2026</p>
        </div>
    </div>`;
}

function buildUserEmail(data) {
    const c = data.ageGroup === 'Over 60' ? '#1F6B52' : '#FF6B35';
    return `<div style="font-family:'Inter',sans-serif;max-width:560px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#FF6B35,#FF8A5B);padding:28px;text-align:center;color:white;border-radius:16px 16px 0 0;">
            <h1 style="font-weight:900;font-size:1.5rem;margin:0 0 6px;">Il tuo Coupon Move Together 🎉</h1>
            <p style="opacity:.9;margin:0;font-size:13px;">ANIF Eurowellness · RiminiWellness 2026</p>
        </div>
        <div style="background:white;padding:28px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;">
            <p>Ciao <strong>${data.name}</strong>, la tua prenotazione è confermata!</p>
            <div style="background:#f9fafb;border:3px dashed #FF6B35;border-radius:14px;padding:22px;text-align:center;margin:20px 0;">
                <span style="font-size:11px;font-weight:700;padding:4px 12px;border-radius:100px;color:white;background:${c};">${data.ageGroup}</span>
                <p style="font-family:'Courier New',monospace;font-weight:900;font-size:2rem;color:#FF6B35;letter-spacing:.15em;margin:14px 0 8px;">${data.code}</p>
                <p style="font-weight:600;color:#374151;margin:0 0 6px;">${data.offer}</p>
                <p style="color:#9CA3AF;font-size:13px;margin:0;">📍 ${data.gymName}</p>
            </div>
            <p style="color:#9CA3AF;font-size:12px;text-align:center;">Valido fino al 31/12/2026 · Presenta alla reception del centro ANIF</p>
        </div>
    </div>`;
}

function buildAdminEmail(data) {
    return `<div style="font-family:'Inter',sans-serif;max-width:480px;padding:24px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#1F6B52;margin:0 0 16px;">🏃 Nuova Prenotazione Move Together</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
            ${[['Nome',data.name],['Email',data.email],['Fascia',data.ageGroup],['Offerta',data.offer],['Sede',data.gymName],['Codice',data.code]]
              .map(([k,v])=>`<tr><td style="padding:8px 12px;font-weight:600;color:#374151;">${k}</td><td style="padding:8px 12px;color:#6B7280;">${v}</td></tr>`)
              .join('')}
        </table>
    </div>`;
}

/* ══════════════════════════════════════════════
   ANTI-SLEEP PING  (Render free tier)
   ══════════════════════════════════════════════ */
if (process.env.APP_URL) {
    setInterval(() => {
        const mod = process.env.APP_URL.startsWith('https') ? require('https') : require('http');
        mod.get(`${process.env.APP_URL}/api/status`, () => {}).on('error', () => {});
    }, 5 * 60 * 1000);
}

app.listen(PORT, () => {
    console.log(`Move Together v3 → http://localhost:${PORT}`);
    console.log(`Data dir → ${DATA_DIR}`);
});
