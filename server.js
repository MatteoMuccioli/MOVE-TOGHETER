'use strict';
require('dotenv').config();

const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const fs         = require('fs');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE    = path.join(__dirname, 'prenotazioni.json');
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'anif_rimini_wellness_2025';

/* ══════════════════════════════════════════════
   MIDDLEWARE
   ══════════════════════════════════════════════ */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

/* ══════════════════════════════════════════════
   FILE I/O – prenotazioni.json
   ══════════════════════════════════════════════ */
function readBookings() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, '[]', 'utf8');
            return [];
        }
        const raw = fs.readFileSync(DATA_FILE, 'utf8').trim();
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error('[DB] Errore lettura prenotazioni.json:', e.message);
        return [];
    }
}

function saveBookings(bookings) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('[DB] Errore scrittura prenotazioni.json:', e.message);
        return false;
    }
}

/* ══════════════════════════════════════════════
   EMAIL – TRANSPORTER
   ══════════════════════════════════════════════ */
function createTransporter() {
    const svc = (process.env.EMAIL_SERVICE || '').toLowerCase();

    if (svc === 'gmail' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
    }

    if (svc === 'sendgrid' && process.env.SENDGRID_API_KEY) {
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY }
        });
    }

    if (svc === 'mailgun' && process.env.MAILGUN_USER && process.env.MAILGUN_PASS) {
        return nodemailer.createTransport({
            host: process.env.MAILGUN_SMTP_HOST || 'smtp.mailgun.org',
            port: 587,
            auth: { user: process.env.MAILGUN_USER, pass: process.env.MAILGUN_PASS }
        });
    }

    console.warn('[EMAIL] Nessun servizio email configurato. Le prenotazioni vengono salvate ma non viene inviata alcuna email.');
    return null;
}

/* ══════════════════════════════════════════════
   EMAIL – TEMPLATE UTENTE (HTML)
   ══════════════════════════════════════════════ */
function buildUserEmail(data) {
    const { name, age, ageGroup, gymName, gymAddress, offer, code } = data;
    const groupColor = ageGroup === 'Over 60' ? '#1F6B52' : '#FF6B35';
    const groupLabel = ageGroup === 'Over 60' ? 'Senior Over 60' : ageGroup === 'Giovane (16-20)' ? 'Giovane (16-20)' : 'Partecipante';
    const initial = name.charAt(0).toUpperCase();
    const now = new Date();
    const dateStr = now.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });

    return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Coupon Move Together</title></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:40px 0;">
  <tr><td align="center">
    <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background:white;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">

      <!-- HEADER -->
      <tr><td style="background:linear-gradient(135deg,#FF6B35 0%,#FF8A5B 100%);padding:36px 40px;text-align:center;">
        <div style="font-size:32px;margin-bottom:6px;">🏃</div>
        <h1 style="margin:0;color:white;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Move Together</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">ANIF Eurowellness · RiminiWellness 2025</p>
      </td></tr>

      <!-- SALUTO -->
      <tr><td style="padding:36px 40px 0;">
        <h2 style="margin:0 0 10px;font-size:22px;color:#111827;font-weight:800;">Ciao ${name}! 🎉</h2>
        <p style="margin:0;color:#6B7280;font-size:15px;line-height:1.6;">
          La tua prenotazione è confermata. Di seguito trovi il tuo <strong style="color:#FF6B35;">Coupon Digitale Move Together</strong> — mostratelo alla reception della sede ANIF scelta.
        </p>
      </td></tr>

      <!-- COUPON CARD -->
      <tr><td style="padding:24px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:3px dashed #FF6B35;border-radius:18px;overflow:hidden;">
          <!-- Coupon header -->
          <tr><td style="background:linear-gradient(135deg,#FF6B35,#FF8A5B);padding:16px 22px;text-align:center;">
            <p style="margin:0;color:white;font-weight:900;font-size:18px;">🎟️ COUPON MOVE TOGETHER</p>
          </td></tr>
          <!-- Coupon body -->
          <tr><td style="padding:20px 22px;background:#FFFBF9;">
            <!-- Avatar + nome -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="width:52px;height:52px;background:${groupColor};border-radius:50%;text-align:center;vertical-align:middle;color:white;font-size:22px;font-weight:900;">${initial}</td>
                <td style="padding-left:14px;vertical-align:middle;">
                  <p style="margin:0 0 4px;font-weight:800;font-size:17px;color:#111827;">${name}</p>
                  <span style="background:${groupColor};color:white;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;">${groupLabel}</span>
                  <span style="color:#9CA3AF;font-size:12px;margin-left:8px;">${age} anni</span>
                </td>
              </tr>
            </table>
            <!-- Offerta -->
            <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;">Offerta Selezionata</p>
            <p style="margin:0 0 14px;font-weight:800;font-size:16px;color:#111827;">${offer}</p>
            <!-- Sede -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border-radius:12px;margin-bottom:16px;">
              <tr><td style="padding:12px 14px;">
                <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;">Sede ANIF</p>
                <p style="margin:0;font-weight:700;font-size:14px;color:#374151;">${gymName}</p>
                ${gymAddress ? `<p style="margin:2px 0 0;font-size:12px;color:#9CA3AF;">${gymAddress}</p>` : ''}
              </td></tr>
            </table>
            <!-- Codice coupon -->
            <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.08em;">Codice Coupon</p>
            <p style="margin:0 0 16px;font-size:26px;font-weight:900;color:#FF6B35;letter-spacing:0.14em;font-family:'Courier New',monospace;">${code}</p>
            <!-- Validità -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px dashed #E5E7EB;padding-top:12px;">
              <tr>
                <td style="font-size:11px;color:#9CA3AF;">Valido fino al <strong style="color:#6B7280;">31/12/2025</strong></td>
                <td align="right" style="font-size:11px;color:#9CA3AF;">Non cedibile</td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <!-- INFO PRESENTAZIONE -->
      <tr><td style="padding:0 40px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:14px;padding:16px 18px;">
          <tr><td>
            <p style="margin:0 0 6px;font-weight:800;color:#15803D;font-size:14px;">✅ Come usare il coupon</p>
            <ul style="margin:0;padding-left:18px;color:#166534;font-size:13px;line-height:1.7;">
              <li>Presenta questo coupon (stampato o sullo smartphone) alla reception</li>
              <li>Il codice <strong>${code}</strong> identifica univocamente la tua prenotazione</li>
              <li>Porta con te un documento d'identità per la verifica dell'età</li>
            </ul>
          </td></tr>
        </table>
      </td></tr>

      <!-- FOOTER -->
      <tr><td style="background:#F9FAFB;padding:24px 40px;border-top:1px solid #F3F4F6;text-align:center;">
        <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">
          Hai ricevuto questa email perché hai completato una prenotazione su <strong>Move Together</strong> il ${dateStr}.
        </p>
        <p style="margin:0;font-size:12px;color:#9CA3AF;">
          © 2025 ANIF Eurowellness ·
          <a href="https://anifeurowellness.it/" style="color:#FF6B35;text-decoration:none;">anifeurowellness.it</a> ·
          RiminiWellness 2025
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ══════════════════════════════════════════════
   EMAIL – TEMPLATE NOTIFICA ANIF (HTML)
   ══════════════════════════════════════════════ */
function buildAdminEmail(booking) {
    const { name, age, ageGroup, email, gymName, gymAddress, offer, code, timestamp } = booking;
    const dateStr = new Date(timestamp).toLocaleString('it-IT', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const row = (label, val) =>
        `<tr><td style="padding:8px 14px;font-size:13px;color:#6B7280;font-weight:600;white-space:nowrap;border-bottom:1px solid #F3F4F6;">${label}</td><td style="padding:8px 14px;font-size:13px;color:#111827;font-weight:700;border-bottom:1px solid #F3F4F6;">${val}</td></tr>`;

    return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"><title>Nuova iscrizione Move Together</title></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:40px 0;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <tr><td style="background:#1F6B52;padding:24px 30px;">
        <p style="margin:0;color:white;font-weight:900;font-size:18px;">📥 Nuova iscrizione Move Together</p>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:12px;">Notifica automatica sistema – ${dateStr}</p>
      </td></tr>

      <tr><td style="padding:24px 30px 0;">
        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
          Un nuovo utente si è iscritto a <strong style="color:#FF6B35;">Move Together</strong>. Riepilogo prenotazione:
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:12px;overflow:hidden;">
          ${row('Nome', name)}
          ${row('Età', `${age} anni`)}
          ${row('Fascia', ageGroup)}
          ${row('Email', `<a href="mailto:${email}" style="color:#FF6B35;">${email}</a>`)}
          ${row('Offerta', offer)}
          ${row('Sede', gymName + (gymAddress ? `<br><small style="color:#9CA3AF;font-weight:400;">${gymAddress}</small>` : ''))}
          ${row('Codice Coupon', `<span style="font-family:monospace;font-size:14px;color:#FF6B35;letter-spacing:.1em;">${code}</span>`)}
          ${row('Data/Ora', dateStr)}
        </table>
      </td></tr>

      <tr><td style="padding:20px 30px;">
        <a href="${process.env.APP_URL || 'http://localhost:' + PORT}/admin.html" style="display:inline-block;padding:12px 24px;background:#FF6B35;color:white;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;">
          → Apri Dashboard Admin
        </a>
      </td></tr>

      <tr><td style="background:#F9FAFB;padding:16px 30px;border-top:1px solid #F3F4F6;text-align:center;">
        <p style="margin:0;font-size:11px;color:#9CA3AF;">Sistema Move Together · ANIF Eurowellness · RiminiWellness 2025</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/* ══════════════════════════════════════════════
   UTILITY – Coupon Code Generator
   ══════════════════════════════════════════════ */
function genCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let c = 'MT25-';
    for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
    c += '-';
    for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
    return c;
}

function classifyAge(age) {
    if (age >= 16 && age <= 20) return 'Giovane (16-20)';
    if (age >= 60)              return 'Over 60';
    return 'Altro';
}

/* ══════════════════════════════════════════════
   API – POST /api/prenota
   ══════════════════════════════════════════════ */
app.post('/api/prenota', async (req, res) => {
    const { name, age, email, gymId, gymName, gymAddress, offer } = req.body;

    // Validazione base
    if (!name || !age || !email || !gymId || !offer) {
        return res.status(400).json({ success: false, message: 'Tutti i campi sono obbligatori.' });
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 110) {
        return res.status(400).json({ success: false, message: 'Età non valida.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Email non valida.' });
    }

    const code     = genCode();
    const ageGroup = classifyAge(ageNum);

    const booking = {
        id:         Date.now(),
        name:       name.trim(),
        age:        ageNum,
        ageGroup,
        email:      email.trim().toLowerCase(),
        gymId,
        gymName:    gymName   || gymId,
        gymAddress: gymAddress || '',
        offer,
        code,
        timestamp:  new Date().toISOString()
    };

    // Salva prenotazione
    const bookings = readBookings();
    bookings.push(booking);
    const saved = saveBookings(bookings);

    if (!saved) {
        console.error('[BOOKING] Impossibile salvare la prenotazione nel file.');
    }

    // Invio email (asincrono, non blocca la risposta)
    const transporter = createTransporter();
    const fromAddress = process.env.EMAIL_USER
        ? `"Move Together – ANIF Eurowellness" <${process.env.EMAIL_USER}>`
        : '"Move Together" <noreply@movetogether.it>';
    const anifTo = process.env.ANIF_EMAIL || 'info@anifeurowellness.it';

    let emailSent = false;
    if (transporter) {
        try {
            await Promise.all([
                // Email all'utente
                transporter.sendMail({
                    from:    fromAddress,
                    to:      booking.email,
                    subject: `🎉 Il tuo Coupon Move Together è pronto! [${code}]`,
                    html:    buildUserEmail({ ...booking })
                }),
                // Notifica ad ANIF
                transporter.sendMail({
                    from:    fromAddress,
                    to:      anifTo,
                    subject: `📥 Nuova iscrizione Move Together – ${name} (${ageGroup})`,
                    html:    buildAdminEmail(booking)
                })
            ]);
            emailSent = true;
            console.log(`[EMAIL] ✅ Email inviate per prenotazione ${code}`);
        } catch (emailErr) {
            console.error('[EMAIL] ❌ Errore invio:', emailErr.message);
        }
    }

    console.log(`[BOOKING] ✅ Nuova prenotazione: ${name} (${ageGroup}) – ${offer} – ${code}`);

    res.json({
        success: true,
        code,
        ageGroup,
        gymName:    booking.gymName,
        gymAddress: booking.gymAddress,
        emailSent,
        message: emailSent
            ? 'Prenotazione confermata! Controlla la tua email.'
            : 'Prenotazione confermata! (Email non configurata, coupon valido lo stesso)'
    });
});

/* ══════════════════════════════════════════════
   API – GET /api/status  (anti-sleep ping)
   ══════════════════════════════════════════════ */
app.get('/api/status', (req, res) => {
    const bookings = readBookings();
    res.json({
        status:        'online',
        app:           'Move Together – ANIF Eurowellness',
        timestamp:     new Date().toISOString(),
        uptime:        Math.floor(process.uptime()),
        totalBookings: bookings.length,
        nodeVersion:   process.version
    });
});

/* ══════════════════════════════════════════════
   API – GET /api/admin/stats  (dashboard dati)
   ══════════════════════════════════════════════ */
app.get('/api/admin/stats', (req, res) => {
    // Autenticazione semplice via header o query param
    const secret = req.headers['x-admin-secret'] || req.query.secret;
    if (secret !== ADMIN_SECRET) {
        return res.status(401).json({ error: 'Non autorizzato. Chiave admin errata.' });
    }

    const bookings = readBookings();

    // Contatori per fascia
    const giovani = bookings.filter(b => b.age >= 16 && b.age <= 20).length;
    const senior  = bookings.filter(b => b.age >= 60).length;
    const altri   = bookings.length - giovani - senior;

    // Coupon intergenerazionali (offerte che coinvolgono entrambe le fasce)
    const interTerms = ['buddy', 'pilates generation', 'intergenerazion', 'open day'];
    const intergenerazionali = bookings.filter(b =>
        interTerms.some(t => (b.offer || '').toLowerCase().includes(t))
    ).length;

    // Per offerta
    const byOffer = {};
    bookings.forEach(b => {
        const key = b.offer || 'N/D';
        byOffer[key] = (byOffer[key] || 0) + 1;
    });

    // Per sede (top 8)
    const byGym = {};
    bookings.forEach(b => {
        const key = b.gymName || b.gymId || 'N/D';
        byGym[key] = (byGym[key] || 0) + 1;
    });
    const byGymTop = Object.fromEntries(
        Object.entries(byGym).sort(([, a], [, b]) => b - a).slice(0, 8)
    );

    // Trend ultimi 7 giorni
    const byDay = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
        byDay[key] = 0;
    }
    bookings.forEach(b => {
        try {
            const d   = new Date(b.timestamp);
            const key = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
            if (Object.prototype.hasOwnProperty.call(byDay, key)) byDay[key]++;
        } catch (_) {}
    });

    // Ultime 25 prenotazioni (più recenti prima)
    const recent = bookings.slice(-25).reverse().map(b => ({
        id:        b.id,
        name:      b.name,
        age:       b.age,
        ageGroup:  b.ageGroup,
        email:     b.email,
        gymName:   b.gymName,
        offer:     b.offer,
        code:      b.code,
        timestamp: b.timestamp
    }));

    res.json({
        total:           bookings.length,
        giovani,
        senior,
        altri,
        intergenerazionali,
        byOffer,
        byGym:           byGymTop,
        byDay,
        recentBookings:  recent,
        lastUpdated:     new Date().toISOString()
    });
});

/* ══════════════════════════════════════════════
   API – GET /api/admin/export  (CSV download)
   ══════════════════════════════════════════════ */
app.get('/api/admin/export', (req, res) => {
    const secret = req.headers['x-admin-secret'] || req.query.secret;
    if (secret !== ADMIN_SECRET) {
        return res.status(401).json({ error: 'Non autorizzato.' });
    }
    const bookings = readBookings();
    const header   = 'ID,Nome,Età,Fascia,Email,Sede,Offerta,Codice Coupon,Data\n';
    const rows     = bookings.map(b =>
        [b.id, `"${b.name}"`, b.age, b.ageGroup, b.email, `"${b.gymName}"`, `"${b.offer}"`, b.code, b.timestamp].join(',')
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="prenotazioni_movetogether_${Date.now()}.csv"`);
    res.send('﻿' + header + rows); // BOM per compatibilità Excel italiano
});

/* ══════════════════════════════════════════════
   START SERVER
   ══════════════════════════════════════════════ */
app.listen(PORT, () => {
    console.log('');
    console.log('  🏃 Move Together – ANIF Eurowellness');
    console.log(`  ✅ Server avviato su http://localhost:${PORT}`);
    console.log(`  📊 Dashboard admin: http://localhost:${PORT}/admin.html`);
    console.log(`  📁 Dati in: ${DATA_FILE}`);
    console.log(`  📧 Email: ${process.env.EMAIL_SERVICE || 'NON configurata'}`);
    console.log('');
});
