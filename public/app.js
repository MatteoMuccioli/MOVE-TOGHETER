/* ============================================================
   MOVE TOGETHER – Frontend App  (v2 Full-Stack)
   API calls via fetch() · Anti-sleep ping ogni 5 min
   ============================================================ */

/* ══════════════════════════════════════════════
   DATA (identico alla v1 statica)
   ══════════════════════════════════════════════ */
const EVENTS = [
    { id:1, title:'Senior & Junior Gym Buddies',       emoji:'🤝', category:'intergenerazionale', badge:'Intergenerazionale',   badgeCls:'bg-purple-100 text-purple-700', headerGradient:'linear-gradient(135deg,#ede9fe,#fce7f3)', color:'#7C3AED', description:'Allenati in coppia con un partner di un\'altra generazione e ottieni uno sconto speciale. Nonni e nipoti, o accoppiamenti casuali guidati dai nostri trainer certificati.',              highlights:['Sconto 30% sull\'abbonamento','Trainer dedicato alla coppia','Kit di benvenuto per entrambi'],           promo:'Sconto 30% per le coppie intergenerazionali', cta:'Prenota Ora' },
    { id:2, title:'Open Day Move Together',            emoji:'🎉', category:'tutti',               badge:'Gratuito · Per tutti', badgeCls:'bg-green-100 text-green-700',   headerGradient:'linear-gradient(135deg,#d1fae5,#ccfbf1)',  color:'#059669', description:'Un giorno di prova completamente gratuito per entrambe le fasce d\'età. Scopri la struttura, incontra i trainer e vivi la prima esperienza Move Together senza alcun impegno.',   highlights:['Ingresso 100% gratuito','Tour guidato della struttura','Mini sessione con personal trainer'],           promo:'Ingresso GRATUITO – nessun obbligo',           cta:'Registrati Gratis' },
    { id:3, title:'Workshop Longevità & Energia',      emoji:'🧘', category:'senior',              badge:'Per Over 60',          badgeCls:'bg-blue-100 text-blue-700',    headerGradient:'linear-gradient(135deg,#dbeafe,#e0e7ff)',  color:'#2563EB', description:'Sessioni di ginnastica dolce e posturale dove i ragazzi assistono e si allenano fianco a fianco con i senior. Un percorso guidato per muoversi con sicurezza e gioia.',          highlights:['Ginnastica dolce e stretching','Posturale e respirazione','Nutrizione per la longevità'],             promo:'Primo workshop a €5 invece di €25',            cta:'Prenota Ora' },
    { id:4, title:'Summer Buddy Challenge',            emoji:'☀️', category:'giovani',             badge:'Per Giovani',          badgeCls:'bg-orange-100 text-orange-700', headerGradient:'linear-gradient(135deg,#ffedd5,#fef3c7)',  color:'#EA580C', description:'Sfida estiva esclusiva per i giovani dai 16 ai 20 anni. Completa 10 sessioni in coppia con un partner Senior e vinci un abbonamento gratuito di 3 mesi.',                        highlights:['3 mesi di abbonamento in palio','App di tracking inclusa','Badge esclusivi sbloccabili'],              promo:'3 mesi GRATIS completando la sfida',           cta:'Partecipa alla Sfida' },
    { id:5, title:'Pilates Generations',               emoji:'🌿', category:'intergenerazionale', badge:'Intergenerazionale',   badgeCls:'bg-purple-100 text-purple-700', headerGradient:'linear-gradient(135deg,#d1fae5,#a7f3d0)',  color:'#047857', description:'Lezioni di Pilates appositamente progettate per essere praticate insieme da giovani e senior. Livelli differenziati, stesso spazio, stessa energia positiva.',                  highlights:['Classi miste garantite','Attrezzatura professionale inclusa','Certificato di partecipazione'],         promo:'Prova gratuita + 20% sconto mensile',          cta:'Prenota una Classe' },
    { id:6, title:'Move Together App Beta',            emoji:'📱', category:'giovani',             badge:'Per Giovani',          badgeCls:'bg-orange-100 text-orange-700', headerGradient:'linear-gradient(135deg,#e0e7ff,#ede9fe)',  color:'#4F46E5', description:'Accesso anticipato alla nostra app di tracking e gamification. Registra passi, sfide completate e gestisci i tuoi badge e coupon digitali direttamente dallo smartphone.',       highlights:['Accesso beta in anteprima assoluta','Notifiche sfide settimanali','QR coupon digitali integrati'],      promo:'Accesso gratuito per i primi 500 iscritti',    cta:'Scarica il Coupon' }
];

const GYMS = [
    { id:'roma',    name:'FitCenter Roma Cornelia',            address:'Via Cornelia 30, 00166 Roma',                lat:41.9028, lng:12.3964, type:'main',    phone:'06 1234 5678', rating:4.8, promos:['Senior & Junior Gym Buddies','Open Day Move Together'] },
    { id:'milano',  name:'Wellness Milano Corso Buenos Aires', address:'Corso Buenos Aires 50, 20124 Milano',         lat:45.4654, lng:9.2029,  type:'partner', phone:'02 9876 5432', rating:4.7, promos:['Workshop Longevità & Energia','Pilates Generations'] },
    { id:'bologna', name:'SportLife Bologna Centro',           address:'Via Rizzoli 10, 40125 Bologna',               lat:44.4949, lng:11.3426, type:'partner', phone:'051 2345 678', rating:4.6, promos:['Open Day Move Together','Summer Buddy Challenge'] },
    { id:'rimini',  name:'RiminiWellness – Centro Fitness',    address:'Viale Regina Elena 22, 47921 Rimini',          lat:44.0678, lng:12.5695, type:'main',    phone:'0541 345678',  rating:4.9, promos:['Tutti i pacchetti Move Together'] },
    { id:'torino',  name:'ActiveLife Torino Po',               address:'Via Po 18, 10124 Torino',                     lat:45.0703, lng:7.6869,  type:'partner', phone:'011 456 789',  rating:4.5, promos:['Senior & Junior Gym Buddies','Workshop Longevità & Energia'] },
    { id:'napoli',  name:'FitNapoli Toledo',                   address:'Via Toledo 200, 80132 Napoli',                lat:40.8358, lng:14.2488, type:'partner', phone:'081 567 890',  rating:4.6, promos:['Open Day Move Together','Pilates Generations'] },
    { id:'firenze', name:'ToscanaFit Firenze',                 address:'Via dei Calzaiuoli 10, 50122 Firenze',        lat:43.7696, lng:11.2558, type:'partner', phone:'055 678 901',  rating:4.7, promos:['Summer Buddy Challenge','Workshop Longevità & Energia'] },
    { id:'palermo', name:'SportSicilia Palermo',               address:'Via della Libertà 55, 90143 Palermo',         lat:38.1157, lng:13.3615, type:'partner', phone:'091 789 012',  rating:4.4, promos:['Open Day Move Together','Senior & Junior Gym Buddies'] },
    { id:'venezia', name:'VeneziaFit Mestre',                  address:'Via Piave 30, 30172 Mestre VE',               lat:45.4908, lng:12.2369, type:'partner', phone:'041 890 123',  rating:4.5, promos:['Open Day Move Together','Pilates Generations'] },
    { id:'bari',    name:'ApuliaFit Bari Centro',              address:'Via Sparano da Bari 140, 70121 Bari',         lat:41.1177, lng:16.8719, type:'partner', phone:'080 901 234',  rating:4.6, promos:['Summer Buddy Challenge','Workshop Longevità & Energia'] },
    { id:'catania', name:'EtnaFit Catania',                    address:'Via Etnea 300, 95127 Catania',                lat:37.5079, lng:15.0830, type:'partner', phone:'095 012 345',  rating:4.3, promos:['Open Day Move Together','Senior & Junior Gym Buddies'] },
    { id:'genova',  name:'LiguriaWellness Genova',             address:'Via XX Settembre 41, 16121 Genova',           lat:44.4075, lng:8.9340,  type:'partner', phone:'010 123 456',  rating:4.5, promos:['Workshop Longevità & Energia','Pilates Generations'] }
];

const CHALLENGES = [
    { id:1, title:'10.000 Passi Condivisi',            description:'Cammina 10.000 passi insieme a un Over 60. Documenta il percorso con una foto da condividere nella community.',                                           icon:'fa-walking',    iconColor:'#FF6B35', xp:150, badge:'🚶', badgeName:'Camminatore',  difficulty:'Facile',    diffColor:'#10B981', reward:'5% sconto extra in palestra',           progress:72,  completed:false },
    { id:2, title:'Insegna un\'App Tech a un Senior',  description:'Mostra a un Over 60 come usare un fitness tracker o l\'app Move Together. Aiutalo a registrare il suo primo allenamento digitale.',                       icon:'fa-mobile-alt', iconColor:'#3B82F6', xp:200, badge:'📱', badgeName:'Tech Mentor',  difficulty:'Media',     diffColor:'#F59E0B', reward:'Accesso beta app + 1 mese gratis',      progress:0,   completed:false },
    { id:3, title:'Sessione Stretching Condivisa',     description:'Partecipa a una sessione di stretching o yoga di almeno 30 minuti insieme a un partecipante Over 60 del tuo centro.',                                    icon:'fa-spa',        iconColor:'#1F6B52', xp:120, badge:'🧘', badgeName:'Zen Master',   difficulty:'Facile',    diffColor:'#10B981', reward:'Ingresso gratuito al prossimo Open Day', progress:100, completed:true  },
    { id:4, title:'Sfida dei 30 Giorni',               description:'Mantieni l\'allenamento per 30 giorni consecutivi. Almeno 2 sessioni a settimana devono essere condivise con un partner.',                                icon:'fa-fire',       iconColor:'#EF4444', xp:500, badge:'🔥', badgeName:'Fuoco Sacro',  difficulty:'Difficile', diffColor:'#EF4444', reward:'Un mese di abbonamento GRATIS',          progress:40,  completed:false },
    { id:5, title:'Ricetta Sana Intergenerazionale',   description:'Prepara un pasto salutare insieme a un Senior o un Giovane e condividi la ricetta nella community Move Together.',                                       icon:'fa-utensils',   iconColor:'#8B5CF6', xp:100, badge:'🍎', badgeName:'Chef Salute',  difficulty:'Facile',    diffColor:'#10B981', reward:'Badge esclusivo + 10% sconto caffetteria',progress:0,   completed:false },
    { id:6, title:'Porta un Amico al Move Together',   description:'Invita un amico (di qualsiasi età!) al prossimo Open Day. Se si iscrive, entrambi ricevete un mese di abbonamento omaggio.',                             icon:'fa-user-plus',  iconColor:'#EC4899', xp:250, badge:'🤝', badgeName:'Ambasciatore', difficulty:'Media',     diffColor:'#F59E0B', reward:'1 mese GRATIS per te e per il tuo amico', progress:0,   completed:false }
];

const BADGES = [
    {icon:'🏃',name:'Primo Passo',   unlocked:true },
    {icon:'🤝',name:'Buddy',         unlocked:true },
    {icon:'🧘',name:'Zen Master',    unlocked:true },
    {icon:'⭐',name:'Stelle',         unlocked:true },
    {icon:'🔥',name:'Fuoco Sacro',   unlocked:false},
    {icon:'🏆',name:'Campione',      unlocked:false},
    {icon:'💪',name:'Forza',         unlocked:false},
    {icon:'🚶',name:'Camminatore',   unlocked:false},
    {icon:'📱',name:'Tech Mentor',   unlocked:false},
    {icon:'🍎',name:'Chef Salute',   unlocked:false},
    {icon:'🌟',name:'Superstar',     unlocked:false},
    {icon:'❤️',name:'Cuore',         unlocked:false},
    {icon:'🎯',name:'Precisione',    unlocked:false},
    {icon:'🌿',name:'Natura',        unlocked:false},
    {icon:'☀️',name:'Estate',         unlocked:false},
    {icon:'🦋',name:'Trasformazione',unlocked:false}
];

/* ══════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════ */
let selectedGym = null;
let map = null;

/* ══════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initNavbar();
    initMobileMenu();
    renderEvents();
    loadChallengeState();
    renderChallenges();
    renderBadges();
    initMap();
    initReveal();
    initPing();          // Anti-sleep + status indicator
    fetchLiveCounter();  // Contatore live iscritti hero
    initCountdown();     // Countdown RiminiWellness
});

/* ══════════════════════════════════════════════
   ANTI-SLEEP PING  (ogni 5 minuti = 300.000 ms)
   Finché questa scheda è aperta, il server Render
   non va mai in standby.
   ══════════════════════════════════════════════ */
function initPing() {
    const dot  = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    const bar  = document.getElementById('status-bar');

    const doPing = async () => {
        try {
            const res  = await fetch('/api/status');
            const data = await res.json();

            if (dot)  { dot.style.background = '#4ADE80'; }
            if (text) { text.textContent = `Server online · ${data.totalBookings} iscritti`; }
            if (bar)  { bar.classList.remove('hidden'); }

            // Aggiorna contatore hero
            updateLiveCounter(data.totalBookings);
        } catch (_) {
            if (dot)  { dot.style.background = '#F87171'; }
            if (text) { text.textContent = 'Server non raggiungibile'; }
        }
    };

    doPing(); // Subito al caricamento
    setInterval(doPing, 300_000); // Poi ogni 5 minuti
}

function fetchLiveCounter() {
    fetch('/api/status')
        .then(r => r.json())
        .then(d => updateLiveCounter(d.totalBookings))
        .catch(() => {});
}

function updateLiveCounter(n) {
    const el = document.getElementById('live-counter');
    if (el) {
        el.innerHTML = `<span class="font-display font-black text-3xl text-gray-800">${n}</span><p class="text-sm text-gray-500 mt-0.5">Iscritti live 🟢</p>`;
    }
}

/* ══════════════════════════════════════════════
   NAVBAR
   ══════════════════════════════════════════════ */
function initNavbar() {
    const nav = document.getElementById('navbar');
    const check = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', check, { passive: true });
    check();
}

/* ══════════════════════════════════════════════
   MOBILE MENU
   ══════════════════════════════════════════════ */
function initMobileMenu() {
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });
}
function closeMobileMenu() {
    document.getElementById('mobile-menu').classList.add('hidden');
}

/* ══════════════════════════════════════════════
   SCROLL REVEAL
   ══════════════════════════════════════════════ */
function initReveal() {
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ══════════════════════════════════════════════
   TOAST NOTIFICATION
   ══════════════════════════════════════════════ */
function showToast(title, msg, type = 'success') {
    const toast = document.getElementById('toast');
    const inner = document.getElementById('toast-inner');
    const icon  = document.getElementById('toast-icon');
    const tit   = document.getElementById('toast-title');
    const txt   = document.getElementById('toast-msg');

    const cfg = {
        success: { bg:'#D1FAE5', ic:'#059669', glyph:'fa-check' },
        error:   { bg:'#FEE2E2', ic:'#DC2626', glyph:'fa-times' },
        info:    { bg:'#DBEAFE', ic:'#2563EB', glyph:'fa-info'  }
    };
    const c = cfg[type] || cfg.info;

    icon.style.background  = c.bg;
    icon.innerHTML = `<i class="fas ${c.glyph}" style="color:${c.ic};"></i>`;
    tit.textContent  = title;
    txt.textContent  = msg;

    toast.classList.remove('hidden', 'hide');
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.classList.add('hidden'), 320);
    }, 4000);
}

/* ══════════════════════════════════════════════
   EVENTS
   ══════════════════════════════════════════════ */
function renderEvents() {
    const grid = document.getElementById('events-grid');
    grid.innerHTML = '';
    EVENTS.forEach(ev => grid.appendChild(buildEventCard(ev)));
}

function buildEventCard(ev) {
    const card = document.createElement('div');
    card.className = 'event-card reveal';
    card.dataset.category = ev.category;
    card.innerHTML = `
        <div class="event-card-header" style="background:${ev.headerGradient}"><span>${ev.emoji}</span></div>
        <div class="p-6">
            <div class="flex items-start justify-between mb-3">
                <span class="chip ${ev.badgeCls}">${ev.badge}</span>
                <span class="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">#movejuntos</span>
            </div>
            <h3 class="font-display font-bold text-xl text-gray-900 mb-2">${ev.title}</h3>
            <p class="text-gray-500 text-sm leading-relaxed mb-4">${ev.description}</p>
            <ul class="space-y-1.5 mb-5">
                ${ev.highlights.map(h => `<li class="flex items-center gap-2 text-sm text-gray-600"><i class="fas fa-check-circle text-xs" style="color:${ev.color}"></i>${h}</li>`).join('')}
            </ul>
            <div class="bg-gray-50 rounded-xl p-3 mb-5 border border-gray-100">
                <p class="text-xs text-gray-400 mb-0.5">Promozione attiva:</p>
                <p class="font-bold text-sm text-gray-900">${ev.promo}</p>
            </div>
            <button onclick="openModal('${ev.category}','${ev.title.replace(/'/g,'\\\'')}')"
                class="w-full py-3 px-5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                style="background:${ev.color}">
                <i class="fas fa-ticket-alt mr-2"></i>${ev.cta}
            </button>
        </div>`;
    return card;
}

function filterEvents(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn =>
        btn.classList.toggle('active', btn.dataset.filter === filter)
    );
    document.querySelectorAll('.event-card').forEach(card => {
        const cat  = card.dataset.category;
        const show = filter === 'tutti' || cat === filter || cat === 'tutti';
        card.classList.toggle('hidden-card', !show);
    });
}

/* ══════════════════════════════════════════════
   MAP
   ══════════════════════════════════════════════ */
function initMap() {
    map = L.map('map', { center:[42.5,12.5], zoom:5.5 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom:18
    }).addTo(map);

    const mkMain    = makeIcon('#1F6B52', 40);
    const mkPartner = makeIcon('#FF6B35', 34);

    GYMS.forEach(gym => {
        L.marker([gym.lat, gym.lng], { icon: gym.type === 'main' ? mkMain : mkPartner })
            .addTo(map)
            .bindPopup(buildPopup(gym), { maxWidth:280, minWidth:280 });
    });
}

function makeIcon(color, size) {
    return L.divIcon({
        html:`<div style="width:${size}px;height:${size}px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 14px rgba(0,0,0,.28);"></div>`,
        iconSize:[size,size], iconAnchor:[size/2,size], popupAnchor:[0,-(size+6)], className:''
    });
}

function buildPopup(gym) {
    const stars = '★'.repeat(Math.floor(gym.rating));
    return `<div style="font-family:'Inter',sans-serif;overflow:hidden;border-radius:18px;">
        <div style="background:linear-gradient(135deg,#FF6B35,#FF8A5B);padding:14px 18px;color:white;">
            <div style="font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;opacity:.85;margin-bottom:3px;">${gym.type==='main'?'⭐ SEDE PRINCIPALE ANIF':'📍 CENTRO PARTNER'}</div>
            <div style="font-size:15px;font-weight:800;line-height:1.3;">${gym.name}</div>
        </div>
        <div style="padding:14px 18px;background:white;">
            <div style="font-size:12px;color:#6B7280;margin-bottom:6px;">📍 ${gym.address}</div>
            <div style="font-size:12px;color:#6B7280;margin-bottom:10px;">📞 ${gym.phone}</div>
            <div style="font-size:10px;font-weight:800;color:#9CA3AF;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;">Promo attive:</div>
            ${gym.promos.map(p=>`<div style="font-size:12px;color:#374151;font-weight:500;margin-bottom:3px;"><span style="color:#FF6B35;">✓</span> ${p}</div>`).join('')}
            <div style="margin:10px 0 12px;font-size:13px;color:#F59E0B;">${stars} <span style="color:#9CA3AF;font-size:11px;">${gym.rating}/5</span></div>
            <button onclick="selectGym('${gym.id}')" style="width:100%;padding:10px;background:#FF6B35;color:white;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;font-family:'Inter',sans-serif;" onmouseover="this.style.background='#E55A25'" onmouseout="this.style.background='#FF6B35'">
                Seleziona questa sede →
            </button>
        </div>
    </div>`;
}

function selectGym(gymId) {
    selectedGym = GYMS.find(g => g.id === gymId);
    if (!selectedGym) return;
    map.closePopup();
    document.getElementById('sgym-name').textContent    = selectedGym.name;
    document.getElementById('sgym-address').textContent = selectedGym.address;
    const bar = document.getElementById('selected-gym-bar');
    bar.classList.remove('hidden');
    bar.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

/* ══════════════════════════════════════════════
   CHALLENGES
   ══════════════════════════════════════════════ */
function renderChallenges() {
    const grid = document.getElementById('challenges-grid');
    grid.innerHTML = '';
    CHALLENGES.forEach(ch => grid.appendChild(buildChallengeCard(ch)));
    setTimeout(initReveal, 50);
}

function buildChallengeCard(ch) {
    const card = document.createElement('div');
    card.className = 'challenge-card reveal' + (ch.completed ? ' completed-card' : '');
    const progressBar = ch.progress > 0 ? `
        <div class="mb-4">
            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
                <span style="color:#9CA3AF;">Progresso</span><span style="color:white;font-weight:700;">${ch.progress}%</span>
            </div>
            <div style="height:6px;background:rgba(255,255,255,.1);border-radius:9999px;overflow:hidden;">
                <div style="height:100%;width:${ch.progress}%;background:${ch.completed?'#10B981':'#FF6B35'};border-radius:9999px;transition:width 1s ease;"></div>
            </div>
        </div>` : '';
    const isLoggedIn = !!localStorage.getItem('mt_token');
    const btn = ch.completed
        ? `<span style="font-size:11px;background:rgba(16,185,129,.2);color:#6EE7B7;font-weight:700;padding:4px 12px;border-radius:9999px;display:flex;align-items:center;gap:4px;"><i class="fas fa-check"></i>Completata</span>`
        : isLoggedIn
            ? `<button onclick="completeChallenge(${ch.id})" style="font-size:11px;background:#FF6B35;color:white;font-weight:700;padding:6px 14px;border-radius:9999px;border:none;cursor:pointer;" onmouseover="this.style.background='#E55A25'" onmouseout="this.style.background='#FF6B35'">Segna completata ✓</button>`
            : `<a href="#" onclick="openAuthModal('login');return false;" style="font-size:11px;color:rgba(255,255,255,.4);font-weight:600;display:flex;align-items:center;gap:4px;"><i class="fas fa-lock" style="font-size:10px;"></i>Accedi per partecipare</a>`;
    card.innerHTML = `
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;">
            <div style="width:46px;height:46px;border-radius:12px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;">
                <i class="fas ${ch.icon}" style="color:${ch.iconColor};font-size:1.2rem;"></i>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
                <span style="font-size:11px;font-weight:700;color:${ch.diffColor};">${ch.difficulty}</span>
                <span style="font-size:10px;background:rgba(255,255,255,.1);color:rgba(255,255,255,.6);padding:2px 8px;border-radius:9999px;">+${ch.xp} XP</span>
            </div>
        </div>
        <h3 style="font-family:'Poppins',sans-serif;font-weight:700;font-size:1.05rem;color:white;margin-bottom:8px;">${ch.title}</h3>
        <p style="color:#9CA3AF;font-size:13px;line-height:1.6;margin-bottom:14px;">${ch.description}</p>
        ${progressBar}
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:1.3rem;">${ch.badge}</span>
                <span style="font-size:11px;color:#9CA3AF;">Badge: <strong style="color:white;">${ch.badgeName}</strong></span>
            </div>
            ${btn}
        </div>
        <div style="padding-top:10px;border-top:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:6px;font-size:11px;color:#FCD34D;">
            <i class="fas fa-gift"></i><span>Premio: ${ch.reward}</span>
        </div>`;
    return card;
}

function loadChallengeState() {
    try {
        const saved = JSON.parse(localStorage.getItem('mt_challenges') || '{}');
        CHALLENGES.forEach(ch => {
            if (saved[ch.id]) {
                ch.completed = true;
                ch.progress  = 100;
            }
        });
    } catch (_) {}
}

function completeChallenge(id) {
    const ch = CHALLENGES.find(c => c.id === id);
    if (!ch || ch.completed) return;

    ch.completed = true;
    ch.progress  = 100;

    try {
        const saved = JSON.parse(localStorage.getItem('mt_challenges') || '{}');
        saved[id] = true;
        localStorage.setItem('mt_challenges', JSON.stringify(saved));
    } catch (_) {}

    const badge = BADGES.find(b => b.name === ch.badgeName);
    if (badge) badge.unlocked = true;

    renderChallenges();
    renderBadges();
    showToast(`+${ch.xp} XP guadagnati! 🎉`, `Badge sbloccato: ${ch.badge} ${ch.badgeName}`, 'success');
}

/* ══════════════════════════════════════════════
   BADGES
   ══════════════════════════════════════════════ */
function renderBadges() {
    const grid = document.getElementById('badges-grid');
    grid.innerHTML = '';
    BADGES.forEach(b => {
        const el = document.createElement('div');
        el.className = 'badge-item ' + (b.unlocked ? 'unlocked' : 'locked');
        el.title = b.unlocked ? b.name : 'Badge bloccato';
        el.innerHTML = `<span class="badge-emoji">${b.unlocked ? b.icon : '🔒'}</span><span class="badge-label ${b.unlocked ? 'text-white' : 'text-white/30'}">${b.unlocked ? b.name : '???'}</span>`;
        grid.appendChild(el);
    });
}

/* ══════════════════════════════════════════════
   MODAL – open / close
   ══════════════════════════════════════════════ */
function openModal(group = '', offer = '') {
    const box = document.getElementById('modal-box');
    renderForm(group, offer);
    box.classList.remove('closing');
    document.getElementById('modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    const box     = document.getElementById('modal-box');
    box.classList.add('closing');
    setTimeout(() => {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }, 220);
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ══════════════════════════════════════════════
   MODAL – FORM
   ══════════════════════════════════════════════ */
function renderForm(preGroup, preOffer) {
    const box = document.getElementById('modal-box');

    // Dati utente loggato (per pre-compilare il form)
    let lu = null;
    try { lu = JSON.parse(localStorage.getItem('mt_user') || 'null'); } catch(_) {}
    const isLogged = !!localStorage.getItem('mt_token');

    const gymOptions = GYMS.map(g =>
        `<option value="${g.id}" data-name="${g.name}" data-address="${g.address}" ${(selectedGym&&selectedGym.id===g.id)||(lu&&lu.gymId===g.id)?'selected':''}>${g.name}</option>`
    ).join('');
    const offerOptions = EVENTS.map(e =>
        `<option value="${e.title}" ${preOffer===e.title?'selected':''}>${e.title}</option>`
    ).join('');

    const loggedBanner = isLogged && lu ? `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:linear-gradient(135deg,rgba(255,107,53,.08),rgba(31,107,82,.06));border:1px solid rgba(255,107,53,.2);border-radius:12px;margin-bottom:4px;">
            <div style="width:32px;height:32px;border-radius:50%;background:#FF6B35;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:.9rem;flex-shrink:0;">${(lu.nome||'?')[0].toUpperCase()}</div>
            <div>
                <p style="margin:0;font-weight:700;font-size:13px;color:#111827;">${lu.nome} ${lu.cognome||''}</p>
                <p style="margin:0;font-size:11px;color:#6B7280;">Dati pre-compilati dal tuo account</p>
            </div>
            <i class="fas fa-check-circle" style="color:#10B981;margin-left:auto;font-size:1rem;"></i>
        </div>` : '';

    box.innerHTML = `
    <div style="position:sticky;top:0;z-index:10;background:white;border-bottom:1px solid #f3f4f6;border-radius:24px 24px 0 0;padding:22px 24px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
        <div>
            <h2 style="font-family:'Poppins',sans-serif;font-weight:900;font-size:1.4rem;color:#111827;margin:0 0 4px;">Prenota o Scarica Coupon</h2>
            <p style="font-size:13px;color:#6B7280;margin:0;">Il server invierà un'email reale con il tuo coupon digitale</p>
        </div>
        <button onclick="closeModal()" style="width:38px;height:38px;border-radius:10px;background:#F3F4F6;border:none;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:15px;color:#6B7280;margin-top:2px;" onmouseover="this.style.background='#E5E7EB'" onmouseout="this.style.background='#F3F4F6'">✕</button>
    </div>
    <form id="booking-form" onsubmit="handleSubmit(event)" style="padding:24px;display:flex;flex-direction:column;gap:18px;">
        ${loggedBanner}
        <div><label class="form-label">Nome e Cognome *</label><input type="text" id="f-name" class="form-input" placeholder="Es. Marco Rossi" required autocomplete="name" value="${lu ? (lu.nome||'') + (lu.cognome ? ' '+lu.cognome : '') : ''}"></div>
        <div>
            <label class="form-label">La tua Età *</label>
            <input type="number" id="f-age" class="form-input" placeholder="${preGroup==='senior'?'Es. 65':preGroup==='giovani'?'Es. 17':'Es. 17 oppure 65'}" min="10" max="99" required value="${lu&&lu.eta ? lu.eta : ''}">
            <p id="age-hint" style="font-size:12px;margin-top:5px;min-height:16px;"></p>
        </div>
        <div><label class="form-label">Email *</label><input type="email" id="f-email" class="form-input" placeholder="la.tua@email.com" required autocomplete="email" value="${lu&&lu.email ? lu.email : ''}"></div>
        <div>
            <label class="form-label">Sede ANIF preferita *</label>
            <select id="f-gym" class="form-input" required>
                <option value="">– Seleziona una sede –</option>${gymOptions}
            </select>
        </div>
        <div>
            <label class="form-label">Offerta selezionata *</label>
            <select id="f-offer" class="form-input" required>
                <option value="">– Seleziona un'offerta –</option>${offerOptions}
            </select>
        </div>
        <div style="display:flex;align-items:flex-start;gap:10px;padding-top:4px;">
            <input type="checkbox" id="f-privacy" required style="width:16px;height:16px;margin-top:2px;accent-color:#FF6B35;cursor:pointer;flex-shrink:0;">
            <label for="f-privacy" style="font-size:13px;color:#6B7280;line-height:1.5;cursor:pointer;">
                Acconsento al trattamento dei dati personali ai sensi del GDPR.
                <a href="https://anifeurowellness.it/" target="_blank" style="color:#FF6B35;font-weight:600;">Privacy Policy ANIF</a>
            </label>
        </div>
        <button type="submit" id="submit-btn" style="width:100%;padding:16px;background:linear-gradient(135deg,#FF6B35,#E55A25);color:white;border:none;border-radius:14px;font-family:'Poppins',sans-serif;font-weight:800;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 6px 24px rgba(255,107,53,.4);transition:all .2s;" onmouseover="this.style.boxShadow='0 8px 32px rgba(255,107,53,.55)'" onmouseout="this.style.boxShadow='0 6px 24px rgba(255,107,53,.4)'">
            <i class="fas fa-ticket-alt"></i>Genera il mio Coupon Digitale<i class="fas fa-arrow-right" style="font-size:.8rem;opacity:.7;"></i>
        </button>
    </form>`;

    // Age hint auto-trigger se pre-compilato
    const ageHintFn = function () {
        const hint = document.getElementById('age-hint');
        const v = parseInt(this.value);
        if (v >= 16 && v <= 20) { hint.textContent = '✅ Fascia Giovani (16-20) – accedi alle offerte dedicate!'; hint.style.cssText = 'font-size:12px;margin-top:5px;color:#FF6B35;font-weight:600;'; }
        else if (v >= 60)       { hint.textContent = '✅ Fascia Over 60 – accedi ai percorsi per la longevità attiva!'; hint.style.cssText = 'font-size:12px;margin-top:5px;color:#1F6B52;font-weight:600;'; }
        else if (v > 0)         { hint.textContent = '💡 Anche le altre fasce partecipano all\'Open Day!'; hint.style.cssText = 'font-size:12px;margin-top:5px;color:#9CA3AF;font-weight:400;'; }
        else                    { hint.textContent = ''; }
    };
    const ageEl = document.getElementById('f-age');
    ageEl.addEventListener('input', ageHintFn);
    if (lu && lu.eta) ageHintFn.call(ageEl);
}

/* ══════════════════════════════════════════════
   FORM SUBMIT → POST /api/prenota
   ══════════════════════════════════════════════ */
async function handleSubmit(e) {
    e.preventDefault();

    const name    = document.getElementById('f-name').value.trim();
    const age     = document.getElementById('f-age').value;
    const email   = document.getElementById('f-email').value.trim();
    const gymSel  = document.getElementById('f-gym');
    const gymId   = gymSel.value;
    const gymOpt  = gymSel.options[gymSel.selectedIndex];
    const gymName = gymOpt ? gymOpt.dataset.name    || gymOpt.text : gymId;
    const gymAddr = gymOpt ? gymOpt.dataset.address || ''          : '';
    const offer   = document.getElementById('f-offer').value;

    // UI: spinner sul pulsante
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Invio in corso...`;

    try {
        const token = localStorage.getItem('mt_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const res  = await fetch('/api/prenota', {
            method:  'POST',
            headers,
            body:    JSON.stringify({ name, age, email, gymId, gymName, gymAddress: gymAddr, offer })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Errore del server.');
        }

        // Aggiorna contatore live
        fetch('/api/status').then(r => r.json()).then(d => updateLiveCounter(d.totalBookings)).catch(()=>{});

        // Mostra il coupon
        renderCoupon({
            name,
            age:        parseInt(age),
            email,
            ageGroup:   data.ageGroup,
            gymName:    data.gymName,
            gymAddress: data.gymAddress,
            offer,
            code:       data.code,
            emailSent:  data.emailSent
        });

    } catch (err) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-ticket-alt"></i>Genera il mio Coupon Digitale<i class="fas fa-arrow-right" style="font-size:.8rem;opacity:.7;"></i>`;
        showToast('Errore', err.message || 'Riprova tra qualche istante.', 'error');
    }
}

/* ══════════════════════════════════════════════
   COUPON RENDERING
   ══════════════════════════════════════════════ */
function renderCoupon({ name, age, email, ageGroup, gymName, gymAddress, offer, code, emailSent }) {
    const box      = document.getElementById('modal-box');
    const gColor   = ageGroup === 'Over 60' ? '#1F6B52' : '#FF6B35';
    const initial  = name.charAt(0).toUpperCase();
    const emailMsg = emailSent
        ? `<span style="color:#059669;font-weight:600;"><i class="fas fa-check-circle mr-1"></i>Email inviata a ${email}</span>`
        : `<span style="color:#9CA3AF;">Email non configurata sul server – coupon valido lo stesso</span>`;

    box.innerHTML = `
    <div style="position:sticky;top:0;z-index:10;background:white;border-bottom:1px solid #f3f4f6;border-radius:24px 24px 0 0;padding:20px 24px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
        <div>
            <h2 style="font-family:'Poppins',sans-serif;font-weight:900;font-size:1.35rem;color:#111827;margin:0 0 3px;">Il tuo Coupon è Pronto! 🎉</h2>
            <p style="font-size:12px;color:#6B7280;margin:0;">${emailMsg}</p>
        </div>
        <button onclick="closeModal()" style="width:38px;height:38px;border-radius:10px;background:#F3F4F6;border:none;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:15px;color:#6B7280;margin-top:2px;" onmouseover="this.style.background='#E5E7EB'" onmouseout="this.style.background='#F3F4F6'">✕</button>
    </div>
    <div style="padding:24px;">
        <div id="print-coupon" class="coupon-wrap" style="margin-bottom:20px;">
            <div style="background:linear-gradient(135deg,#FF6B35,#FF8A5B);padding:18px 22px;text-align:center;color:white;">
                <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;">
                    <i class="fas fa-running" style="font-size:1.3rem;"></i>
                    <span style="font-family:'Poppins',sans-serif;font-weight:900;font-size:1.4rem;">Move Together</span>
                </div>
                <p style="font-size:12px;opacity:.85;font-weight:600;margin:0;">ANIF Eurowellness · RiminiWellness 2025</p>
            </div>
            <div style="padding:20px 22px;background:white;">
                <div style="display:flex;align-items:center;gap:14px;padding-bottom:16px;border-bottom:2px dashed #E5E7EB;margin-bottom:14px;">
                    <div style="width:52px;height:52px;border-radius:50%;background:${gColor};display:flex;align-items:center;justify-content:center;color:white;font-family:'Poppins',sans-serif;font-weight:900;font-size:1.4rem;flex-shrink:0;">${initial}</div>
                    <div>
                        <p style="font-family:'Poppins',sans-serif;font-weight:900;font-size:1.15rem;color:#111827;margin:0 0 4px;">${name}</p>
                        <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:9999px;color:white;background:${gColor};">${ageGroup}</span>
                        <span style="font-size:12px;color:#9CA3AF;margin-left:6px;">${age} anni</span>
                    </div>
                </div>
                <div style="margin-bottom:10px;">
                    <p style="font-size:10px;color:#9CA3AF;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin:0 0 3px;">Offerta Selezionata</p>
                    <p style="font-family:'Poppins',sans-serif;font-weight:700;font-size:1rem;color:#111827;margin:0;">${offer}</p>
                </div>
                <div style="background:#F9FAFB;border-radius:12px;padding:10px 14px;margin-bottom:14px;border:1px solid #F3F4F6;">
                    <p style="font-size:10px;color:#9CA3AF;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin:0 0 3px;">Sede ANIF</p>
                    <p style="font-weight:700;color:#374151;font-size:.9rem;margin:0;">${gymName}</p>
                    ${gymAddress ? `<p style="font-size:12px;color:#9CA3AF;margin:2px 0 0;">${gymAddress}</p>` : ''}
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;">
                    <div>
                        <p style="font-size:10px;color:#9CA3AF;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px;">Codice Coupon</p>
                        <p style="font-family:'Poppins',sans-serif;font-weight:900;font-size:1.25rem;color:#FF6B35;letter-spacing:.12em;margin:0;">${code}</p>
                    </div>
                    <div id="qr-slot" style="width:96px;height:96px;flex-shrink:0;border-radius:10px;overflow:hidden;border:2px solid #F3F4F6;display:flex;align-items:center;justify-content:center;background:#f9f9f9;"></div>
                </div>
                <div style="display:flex;align-items:flex-end;justify-content:center;gap:1px;height:56px;background:#F9FAFB;border-radius:10px;padding:6px 10px;margin-bottom:6px;">
                    ${buildBarcode()}
                </div>
                <p style="text-align:center;font-size:10px;color:#9CA3AF;letter-spacing:.15em;margin:0 0 12px;">${code.replace(/-/g,' · ')}</p>
                <div style="border-top:2px dashed #E5E7EB;padding-top:10px;display:flex;justify-content:space-between;font-size:11px;color:#9CA3AF;">
                    <span>Valido fino al <strong style="color:#6B7280;">31/12/2025</strong></span>
                    <span>Non cedibile</span>
                </div>
            </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
            <button onclick="printCoupon()" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:#F3F4F6;color:#374151;border:none;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;" onmouseover="this.style.background='#E5E7EB'" onmouseout="this.style.background='#F3F4F6'"><i class="fas fa-print"></i>Stampa</button>
            <button onclick="shareCoupon('${code}')" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:#1F6B52;color:white;border:none;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;" onmouseover="this.style.background='#155240'" onmouseout="this.style.background='#1F6B52'"><i class="fas fa-share-alt"></i>Condividi</button>
        </div>
        <button onclick="closeModal()" style="width:100%;padding:12px;border:2px solid #E5E7EB;background:transparent;color:#6B7280;border-radius:12px;font-weight:600;font-size:13px;cursor:pointer;" onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='transparent'">
            Chiudi e torna al sito
        </button>
    </div>`;

    // QR Code
    setTimeout(() => {
        const slot = document.getElementById('qr-slot');
        if (slot && typeof QRCode !== 'undefined') {
            slot.innerHTML = '';
            new QRCode(slot, { text:`MOVETOGETHER:${code}:${name.replace(/ /g,'_')}`, width:92, height:92, colorDark:'#1a1a2e', colorLight:'#ffffff', correctLevel: QRCode.CorrectLevel.M });
        }
    }, 80);

    showToast('Prenotazione confermata!', emailSent ? 'Controlla la tua email.' : `Codice: ${code}`, 'success');
}

/* ── Barcode SVG ── */
function buildBarcode() {
    const p = [3,1,2,1,3,2,1,2,1,3,1,2,3,1,2,1,3,2,1,2,1,3,1,2,1,3,2,1,2,1,3,1,2,3,1,2,1,3,2,1,2,1,3,1,2,3,1,2];
    return p.map((w,i) => {
        const h = 30 + (i%3===0 ? 12 : i%2===0 ? 6 : 0);
        return i%2===0
            ? `<div class="barcode-bar" style="width:${w*2.2}px;height:${h}px;align-self:flex-end;"></div>`
            : `<div style="width:${w*2.2}px;height:${h}px;align-self:flex-end;"></div>`;
    }).join('');
}

/* ── Print ── */
function printCoupon() {
    const html = document.getElementById('print-coupon').outerHTML;
    const w = window.open('', '_blank', 'width=560,height=800');
    w.document.write(`<!DOCTYPE html><html><head>
        <meta charset="UTF-8"><title>Coupon Move Together</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Poppins:wght@700;900&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
        <style>body{margin:40px auto;max-width:480px;font-family:'Inter',sans-serif;background:#f8f7f4;}.coupon-wrap{border:3px dashed #FF6B35;border-radius:20px;overflow:hidden;}@media print{body{margin:0;}}</style>
    </head><body>${html}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 600);
}

/* ══════════════════════════════════════════════
   DARK MODE
   ══════════════════════════════════════════════ */
function initDarkMode() {
    const saved = localStorage.getItem('mt_theme');
    if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

    const toggle = document.getElementById('dark-toggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('mt_theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('mt_theme', 'dark');
            }
        });
    }
}

/* ══════════════════════════════════════════════
   COUNTDOWN  RiminiWellness
   ══════════════════════════════════════════════ */
function initCountdown() {
    const target = new Date('2026-05-28T09:00:00');
    const els = {
        d: document.getElementById('cd-days'),
        h: document.getElementById('cd-hours'),
        m: document.getElementById('cd-mins'),
        s: document.getElementById('cd-secs')
    };
    if (!els.d) return;
    const tick = () => {
        const diff = Math.max(0, target - Date.now());
        els.d.textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
        els.h.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
        els.m.textContent = String(Math.floor((diff % 3600000)  / 60000)).padStart(2, '0');
        els.s.textContent = String(Math.floor((diff % 60000)    / 1000)).padStart(2, '0');
    };
    tick();
    setInterval(tick, 1000);
}

/* ── Share ── */
function shareCoupon(code) {
    const text = `Ho ricevuto il mio coupon Move Together! 🏃 Codice: ${code}\nScopri il progetto ANIF Eurowellness per RiminiWellness 2025!`;
    if (navigator.share) {
        navigator.share({ title:'Coupon Move Together', text, url: location.href }).catch(()=>{});
    } else {
        navigator.clipboard.writeText(text)
            .then(() => showToast('Copiato!', 'Testo copiato negli appunti.', 'info'))
            .catch(() => { prompt('Copia il testo:', text); });
    }
}
