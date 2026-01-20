// Mock Data for Calls
const calls = [
    {
        id: 1,
        title: "Deep Dive: Building Autonomous Agents",
        host: "Julian Goldie",
        avatar: "JG",
        date: new Date(Date.now() + 10000000), // ~3 hours from now
        type: "Strategy",
        duration: "90 min"
    },
    {
        id: 2,
        title: "Weekly Q&A: Troubleshooting n8n Workflows",
        host: "Mike Ross",
        avatar: "MR",
        date: new Date(Date.now() + 86400000 + 36000000), // ~Tomorrow
        type: "Tech",
        duration: "60 min"
    },
    {
        id: 3,
        title: "Sales Mastery: Closing High-Ticket AI Clients",
        host: "Sarah Jenkins",
        avatar: "SJ",
        date: new Date(Date.now() + 172800000 + 50000000), // ~2 days
        type: "Sales",
        duration: "45 min"
    },
    {
        id: 4,
        title: "New Member Orientation",
        host: "Team Boardroom",
        avatar: "TB",
        date: new Date(Date.now() + 604800000), // ~1 week
        type: "Community",
        duration: "30 min"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderNextCall();
    renderSchedule();
    startTimer();
}

function renderNextCall() {
    const nextCall = calls[0];
    const container = document.getElementById('next-call-hero-container');

    container.innerHTML = `
        <div class="next-call-card">
            <div class="next-call-info">
                <div class="live-indicator">
                    <div class="pulsing-dot"></div>
                    Next Session
                </div>
                <h2>${nextCall.title}</h2>
                <div class="host-info">
                    <div class="host-avatar">${nextCall.avatar}</div>
                    <span style="color: var(--text-muted); font-weight: 500;">Hosted by <strong style="color: #fff;">${nextCall.host}</strong></span>
                    <span class="tag tag-strategy" style="margin-left: 1rem;">${nextCall.type}</span>
                </div>
                <button class="action-btn btn-join" onclick="showToast('Lobby opens 10 minutes before start.')">
                    <i class="ph-bold ph-video-camera" style="margin-right: 8px;"></i>
                    Join Waiting Room
                </button>
            </div>
            
            <div class="countdown-timer">
                <div class="time-unit">
                    <div class="time-val" id="timer-h">02</div>
                    <div class="time-label">Hours</div>
                </div>
                <div class="time-unit">
                    <div class="time-val">:</div>
                </div>
                <div class="time-unit">
                    <div class="time-val" id="timer-m">45</div>
                    <div class="time-label">Minutes</div>
                </div>
                <div class="time-unit">
                    <div class="time-val">:</div>
                </div>
                <div class="time-unit">
                    <div class="time-val" id="timer-s">12</div>
                    <div class="time-label">Seconds</div>
                </div>
            </div>
        </div>
    `;
}

function renderSchedule() {
    const list = document.getElementById('schedule-list');
    /* Skip first one as it's the hero */
    const upcoming = calls.slice(1);

    list.innerHTML = upcoming.map(call => {
        const dateObj = new Date(call.date);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('default', { month: 'short' });
        const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="call-card">
                <div class="call-date">
                    <span class="date-day">${day}</span>
                    <span class="date-month">${month}</span>
                </div>
                
                <div class="call-details">
                    <div class="call-tags">
                        <span class="tag tag-${call.type.toLowerCase() === 'technology' ? 'tech' : 'strategy'}">${call.type}</span>
                    </div>
                    <div class="call-title">${call.title}</div>
                    <div class="call-time">
                        <i class="ph ph-clock"></i> ${time} • ${call.duration} • with ${call.host}
                    </div>
                </div>
                
                <div class="call-actions">
                    <button class="action-btn btn-cal" onclick="addToCalendar('${call.title}')" title="Add to Calendar">
                        <i class="ph ph-calendar-plus"></i>
                    </button>
                    <button class="action-btn btn-cal" onclick="setReminder('${call.title}')" title="Set Reminder">
                        <i class="ph ph-bell"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Timer Logic
function startTimer() {
    const target = calls[0].date.getTime();

    setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;

        if (diff < 0) return;

        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('timer-h').innerText = String(hours).padStart(2, '0');
        document.getElementById('timer-m').innerText = String(minutes).padStart(2, '0');
        document.getElementById('timer-s').innerText = String(seconds).padStart(2, '0');
    }, 1000);
}

// Interactions
function showToast(msg) {
    const toast = document.getElementById('toast-container');
    const msgEl = document.getElementById('toast-message');
    msgEl.innerText = msg;

    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function addToCalendar(title) {
    // Simulating Calendar add
    showToast(`Added "${title}" to your calendar.`);
}

function setReminder(title) {
    showToast(`Reminder set for "${title}"`);
}
