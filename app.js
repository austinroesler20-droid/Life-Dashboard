const HABITS = {
    morning: {
        label: 'Morning Routine',
        icon: '🌅',
        colorClass: 'morning',
        items: [
            { id: 'make-bed',            label: 'Make my bed' },
            { id: 'morning-walk',        label: '15 minute walk' },
            { id: 'cold-shower',         label: 'Cold shower' },
            { id: 'water-morning',       label: 'Drink 32oz of water before coffee' },
            { id: 'brush-teeth-floss',   label: 'Brush teeth & floss' },
            { id: 'wash-face-morning',   label: 'Wash face & moisturize' },
            { id: 'pray',               label: 'Pray' },
            { id: 'vitamins',           label: 'Vitamins' },
            { id: 'protein-shake',      label: 'Protein shake' },
            { id: 'creatine',           label: 'Creatine' },
            { id: 'meditation',         label: 'Meditation' },
        ]
    },
    health: {
        label: 'Health & Body',
        icon: '💪',
        colorClass: 'health',
        items: [
            { id: 'limit-apps',         label: 'Less than 10 minutes on wasted apps' },
            { id: 'complete-workout',   label: 'Complete workout' },
            { id: 'red-light',          label: 'Red light therapy session' },
            { id: 'gallon-water',       label: 'Drink 1 gallon of water' },
            { id: 'stretching',         label: '10 minutes of stretching & mobility' },
            { id: 'kegels',             label: 'Kegels', note: '⚡ Strengthens pelvic floor, improves posture, and protects long-term health. Non-negotiable.' },
            { id: 'gratitude',          label: 'Write one thing you\'re grateful for' },
            { id: 'sleep',              label: '7-8 hours of sleep' },
        ]
    },
    matrix: {
        label: 'Escape the Matrix',
        icon: '🧠',
        colorClass: 'matrix',
        items: [
            { id: 'read',               label: 'Read for 20 minutes' },
            { id: 'ai-business',        label: '15 minutes on AI consulting business' },
        ]
    },
    evening: {
        label: 'Evening Routine',
        icon: '🌙',
        colorClass: 'evening',
        items: [
            { id: 'brush-teeth-night',  label: 'Brush teeth' },
            { id: 'wash-face-night',    label: 'Wash face, moisturize & lotion' },
            { id: 'no-phone',           label: 'No phone 30 minutes before bed' },
            { id: 'plan-tomorrow',      label: 'Plan tomorrow' },
        ]
    }
};

const QUOTES = [
    "You don't rise to the level of your goals, you fall to the level of your systems.",
    "A king doesn't need permission to take his throne.",
    "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
    "Do something today that your future self will thank you for.",
    "The difference between who you are and who you want to be is what you do.",
    "Champions are made from something deep inside them — a desire, a dream, a vision.",
    "Discipline is the bridge between goals and accomplishment.",
    "The phoenix rises from the ashes. So do you.",
    "What you do every day matters more than what you do once in a while.",
    "Success is the sum of small efforts repeated day in and day out.",
    "You are one decision away from a completely different life.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Every master was once a disaster. Keep going.",
    "Rise above the storm and you will find the sunshine.",
    "Kings are not born — they are built one day at a time.",
    "Your morning routine is your crown. Wear it every day.",
    "Comfort is the enemy of growth. Choose hard.",
    "The man who wakes with purpose cannot be stopped.",
    "Iron sharpens iron. You sharpen yourself daily.",
    "Be so disciplined that discipline becomes your identity.",
];

const JSONBIN_BIN_ID  = '6a2ed888da38895dfebf61f5';
const JSONBIN_API_KEY = '$2a$10$f4VXQRC9w/7slqzM33xbHuCBuYX.9HDxFMgZ4g7dkQ3U9oStRiTr6';

let today = new Date().toISOString().split('T')[0];

// ── Cloud Sync ─────────────────────────────────────────

async function loadFromCloud() {
    if (JSONBIN_BIN_ID === 'YOUR_BIN_ID_HERE') return;
    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });
        if (!res.ok) return;
        const json = await res.json();
        const cloud = json.record;
        if (cloud.phoenixData) localStorage.setItem('phoenixData', JSON.stringify(cloud.phoenixData));
    } catch (e) { console.warn('Cloud load failed', e); }
}

async function saveToCloud() {
    if (JSONBIN_BIN_ID === 'YOUR_BIN_ID_HERE') return;
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY },
            body: JSON.stringify({
                phoenixData: JSON.parse(localStorage.getItem('phoenixData') || '{"habits":{},"wins":{}}')
            })
        });
    } catch (e) { console.warn('Cloud save failed', e); }
}

// ── Auth ──────────────────────────────────────────────

window.addEventListener('load', async function () {
    await loadFromCloud();
    checkAuth();
});

function checkAuth() {
    const hasPw = !!localStorage.getItem('phoenixPwHash');
    const isAuthed = !!sessionStorage.getItem('phoenixAuth');
    if (!hasPw) {
        document.getElementById('screen-set').style.display = '';
        document.getElementById('screen-login').style.display = 'none';
    } else if (!isAuthed) {
        document.getElementById('screen-set').style.display = 'none';
        document.getElementById('screen-login').style.display = '';
    } else {
        document.getElementById('auth-overlay').style.display = 'none';
        document.getElementById('app').style.display = '';
        bootApp();
    }
}

function setPassword() {
    const pw  = document.getElementById('set-pw').value.trim();
    const c   = document.getElementById('set-pw-confirm').value.trim();
    const err = document.getElementById('set-error');
    if (pw.length < 4) { err.textContent = 'At least 4 characters required.'; return; }
    if (pw !== c)      { err.textContent = 'Passwords do not match.'; return; }
    localStorage.setItem('phoenixPwHash', hashPw(pw));
    sessionStorage.setItem('phoenixAuth', '1');
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('app').style.display = '';
    bootApp();
}

function login() {
    const pw  = document.getElementById('login-pw').value;
    const err = document.getElementById('login-error');
    if (hashPw(pw) !== localStorage.getItem('phoenixPwHash')) {
        err.textContent = 'Incorrect password.';
        document.getElementById('login-pw').value = '';
        return;
    }
    sessionStorage.setItem('phoenixAuth', '1');
    document.getElementById('auth-overlay').style.display = 'none';
    document.getElementById('app').style.display = '';
    bootApp();
}

function logout() {
    sessionStorage.removeItem('phoenixAuth');
    location.reload();
}

function hashPw(pw) {
    const s = pw + 'phoenix-king-salt';
    let h = 0;
    for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    return Math.abs(h).toString(36);
}

// ── Boot ──────────────────────────────────────────────

function bootApp() {
    today = new Date().toISOString().split('T')[0];
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    setQuote();
    renderSections();
    loadWin();
    renderWeekly();
    renderHistory();
    updateRing();
}

// ── Data ──────────────────────────────────────────────

function loadData() {
    return JSON.parse(localStorage.getItem('phoenixData') || '{"habits":{},"wins":{}}');
}

function saveData(data) {
    localStorage.setItem('phoenixData', JSON.stringify(data));
    saveToCloud();
}

// ── Quote ─────────────────────────────────────────────

function setQuote() {
    const idx = Math.floor(Date.now() / 86400000) % QUOTES.length;
    document.getElementById('quote-card').textContent = '“' + QUOTES[idx] + '”';
}

// ── Win of the Day ────────────────────────────────────

function loadWin() {
    const data = loadData();
    document.getElementById('win-input').value = (data.wins && data.wins[today]) ? data.wins[today] : '';
}

function saveWin() {
    const data = loadData();
    if (!data.wins) data.wins = {};
    data.wins[today] = document.getElementById('win-input').value.trim();
    saveData(data);
}

// ── Sections ──────────────────────────────────────────

function renderSections() {
    const container = document.getElementById('sections');
    container.innerHTML = '';
    const data = loadData();
    const todayHabits = data.habits[today] || {};

    Object.entries(HABITS).forEach(([key, section]) => {
        const done  = section.items.filter(h => todayHabits[h.id]).length;
        const total = section.items.length;

        const div = document.createElement('div');
        div.className = `section ${section.colorClass}`;
        div.innerHTML = `
            <div class="section-header">
                <span class="section-icon">${section.icon}</span>
                <h2>${section.label}</h2>
                <span class="section-score" id="score-${key}">${done}/${total}</span>
            </div>
            <div class="habits-list" id="list-${key}"></div>`;
        container.appendChild(div);

        const list = div.querySelector(`#list-${key}`);
        section.items.forEach(habit => {
            const checked = !!todayHabits[habit.id];
            const streak  = getStreak(habit.id, data);
            const row = document.createElement('div');
            row.className = `habit-row${checked ? ' checked' : ''}`;
            row.id = `row-${habit.id}`;
            row.innerHTML = `
                <input type="checkbox" class="habit-check" ${checked ? 'checked' : ''} onchange="toggleHabit('${habit.id}', this)">
                <div class="habit-info">
                    <div class="habit-label">${habit.label}</div>
                    ${habit.note ? `<div class="habit-note">${habit.note}</div>` : ''}
                </div>
                ${streak > 0 ? `<span class="streak-badge">🔥 ${streak}d</span>` : ''}`;
            list.appendChild(row);
        });
    });
}

function toggleHabit(id, checkbox) {
    const data = loadData();
    if (!data.habits[today]) data.habits[today] = {};
    data.habits[today][id] = checkbox.checked;
    saveData(data);

    document.getElementById(`row-${id}`).classList.toggle('checked', checkbox.checked);
    updateSectionScores(data);
    updateRing();
    renderWeekly();
    renderHistory();
}

function updateSectionScores(data) {
    const todayHabits = data.habits[today] || {};
    Object.entries(HABITS).forEach(([key, section]) => {
        const done  = section.items.filter(h => todayHabits[h.id]).length;
        const total = section.items.length;
        const el = document.getElementById(`score-${key}`);
        if (el) el.textContent = `${done}/${total}`;
    });
}

// ── Streak ────────────────────────────────────────────

function getStreak(habitId, data) {
    let streak = 0;
    const check = new Date();
    check.setDate(check.getDate() - 1);
    for (let i = 0; i < 365; i++) {
        const d = check.toISOString().split('T')[0];
        if (data.habits[d] && data.habits[d][habitId]) {
            streak++;
            check.setDate(check.getDate() - 1);
        } else break;
    }
    return streak;
}

// ── Completion Ring ───────────────────────────────────

function updateRing() {
    const data = loadData();
    const todayHabits = data.habits[today] || {};
    const all  = Object.values(HABITS).flatMap(s => s.items);
    const done = all.filter(h => todayHabits[h.id]).length;
    const pct  = Math.round((done / all.length) * 100);
    document.getElementById('ring-progress').setAttribute('stroke-dasharray', `${pct}, 100`);
    document.getElementById('ring-label').textContent = `${pct}%`;
}

// ── Weekly Grid ───────────────────────────────────────

function renderWeekly() {
    const data = loadData();
    const all  = Object.values(HABITS).flatMap(s => s.items);
    const container = document.getElementById('weekly-grid');
    container.innerHTML = '';
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr     = d.toISOString().split('T')[0];
        const dayHabits   = data.habits[dateStr] || {};
        const done        = all.filter(h => dayHabits[h.id]).length;
        const pct         = Math.round((done / all.length) * 100);
        const isToday     = dateStr === today;
        const bg = pct === 0 ? '#1a1a1a' : pct < 40 ? '#7f1d1d' : pct < 70 ? '#92400e' : pct < 90 ? '#065f46' : '#16a34a';

        const col = document.createElement('div');
        col.className = 'week-day';
        col.innerHTML = `
            <div class="week-day-label">${dayNames[d.getDay()]}${isToday ? ' ★' : ''}</div>
            <div class="week-dot-wrap">
                <div class="week-dot-inner" style="background:${bg}; color:#fff; border:${isToday ? '2px solid #f59e0b' : 'none'}">
                    ${pct > 0 ? pct + '%' : ''}
                </div>
            </div>`;
        container.appendChild(col);
    }
}

// ── History Grid ──────────────────────────────────────

function renderHistory() {
    const data = loadData();
    const all  = Object.values(HABITS).flatMap(s => s.items);
    const container = document.getElementById('history-grid');
    container.innerHTML = '';

    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr   = d.toISOString().split('T')[0];
        const dayHabits = data.habits[dateStr] || {};
        const done      = all.filter(h => dayHabits[h.id]).length;
        const pct       = Math.round((done / all.length) * 100);
        const bg = pct === 0 ? '#1a1a1a' : pct < 40 ? '#7f1d1d' : pct < 70 ? '#92400e' : pct < 90 ? '#065f46' : '#16a34a';

        const dot = document.createElement('div');
        dot.className = 'history-dot';
        dot.style.background = bg;
        dot.innerHTML = `<span class="history-tooltip">${dateStr}: ${pct}% (${done}/${all.length})</span>`;
        container.appendChild(dot);
    }
}
