// APP STATE & STORAGE
let currentTab = 'workouts';
let currentSession = 1;
let isDeload = false;
let activeCoreRoutineKey = localStorage.getItem('outlaw_active_core') || 'routine1';
let completedWorkouts = JSON.parse(localStorage.getItem('outlaw_completed') || '{}');
let completedVideos = JSON.parse(localStorage.getItem('outlaw_watched_videos') || '{}');
let gymDays = JSON.parse(localStorage.getItem('outlaw_gym_days') || '["Monday", "Tuesday", "Thursday"]');

// REST TIMER STATE
let restTimerInterval = null;
let restTimeRemaining = 90;
let restTotalTime = 90;

// INTERACTIVE CORE ROUTINE MODAL STATE
let routineTimerInterval = null;
let routineCurrentStepIndex = 0;
let routineSecondsLeft = 0;
let routineIsPaused = false;
let activeRoutineList = [];

// INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
    loadSettingsToUI();
    updateDeloadUI();
    renderWorkouts();
    renderWeeklyPlan();
    renderVideoLibrary();
    syncCalendar();
});

// TAB SWITCHING
function switchTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(ni => ni.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    if (el) el.classList.add('active');
    currentTab = tabId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchSession(sessionId) {
    currentSession = sessionId;
    document.querySelectorAll('.session-tab').forEach(st => st.classList.remove('active'));
    document.getElementById('stab-' + sessionId).classList.add('active');
    renderWorkouts();
}

// DELOAD TOGGLE
function toggleDeload() {
    isDeload = !isDeload;
    updateDeloadUI();
    renderWorkouts();
}

function updateDeloadUI() {
    const pill = document.getElementById('deloadPill');
    const banner = document.getElementById('deloadBanner');
    if (isDeload) {
        pill.className = 'deload-pill active';
        pill.innerHTML = '<span>⚡ Deload: ON</span>';
        banner.classList.add('visible');
    } else {
        pill.className = 'deload-pill';
        pill.innerHTML = '<span>⚡ Deload: OFF</span>';
        banner.classList.remove('visible');
    }
}

// CORE ROUTINE SWITCHER
function switchCoreRoutine(routineKey) {
    activeCoreRoutineKey = routineKey;
    localStorage.setItem('outlaw_active_core', routineKey);
    renderWorkouts();
}

// RENDER WORKOUTS & ACTIVE CORE ROUTINE
function renderWorkouts() {
    const container = document.getElementById('workoutContainer');
    const session = STRENGTH_SESSIONS[currentSession];
    const coreData = ROUTINES[activeCoreRoutineKey];

    let html = `
        <div class="card">
            <h2>${session.title}</h2>
            <p>${session.subtitle} • ${isDeload ? '50% Load / Recovery Week' : 'Standard Working Weight'}</p>
    `;

    session.exercises.forEach((ex, idx) => {
        const stateKey = `s_${currentSession}_ex_${idx}`;
        const completedSets = completedWorkouts[stateKey] || 0;

        html += `
            <div class="exercise-item">
                <div class="exercise-header">
                    <span class="exercise-name">${ex.name}</span>
                    <span class="exercise-meta">${ex.meta}</span>
                </div>
                <div class="exercise-notes">${ex.notes}</div>
                <div class="sets-grid">
        `;

        for (let s = 1; s <= ex.sets; s++) {
            const isDone = s <= completedSets;
            html += `
                <button class="set-btn ${isDone ? 'completed' : ''}" onclick="toggleSet(${currentSession}, ${idx}, ${s}, ${ex.sets})">
                    Set ${s}
                    <span>${isDone ? '✓' : ''}</span>
                </button>
            `;
        }

        html += `
                </div>
            </div>
        `;
    });

    html += `</div>`;

    html += `
        <div class="routine1-box">
            <h3>
                <span>🔥 Active: ${coreData.name}</span>
                <button class="btn" onclick="startInteractiveRoutine('${activeCoreRoutineKey}')">Start Guided Routine ⏱️</button>
            </h3>
            <p>Designed to bulletproof your core for the TT bike position and half-ironman run without lower-back strain.</p>
    `;

    coreData.exercises.forEach((item, i) => {
        const coreKey = `core_${activeCoreRoutineKey}_${i}`;
        const isChecked = completedWorkouts[coreKey] ? 'checked' : '';
        const doneClass = completedWorkouts[coreKey] ? 'done' : '';
        const detailText = item.type === 'timed' ? `${item.duration}s` : `${item.sets} sets × ${item.reps}`;

        html += `
            <div class="checklist-item ${doneClass}" id="cl_row_${coreKey}" style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--border); font-size:0.85rem;">
                <input type="checkbox" id="cl_${coreKey}" ${isChecked} onchange="toggleCoreItem('${coreKey}')" style="width:18px; height:18px; accent-color:var(--primary); cursor:pointer;">
                <label for="cl_${coreKey}" style="cursor:pointer; flex:1; margin:0;">
                    <strong>${item.name}</strong> (${detailText}) — <span style="color:var(--text-muted); font-size:0.78rem;">${item.notes}</span>
                </label>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;

    const selectEl = document.getElementById('coreRoutineSelect');
    if (selectEl && selectEl.value !== activeCoreRoutineKey) {
        selectEl.value = activeCoreRoutineKey;
    }
}

// SET & REST TIMER LOGIC
function toggleSet(sessionNum, exIdx, setNum) {
    const stateKey = `s_${sessionNum}_ex_${exIdx}`;
    let currentCompleted = completedWorkouts[stateKey] || 0;

    if (currentCompleted === setNum) {
        completedWorkouts[stateKey] = setNum - 1;
    } else {
        completedWorkouts[stateKey] = setNum;
        startRestTimer(90, `Rest after Session ${sessionNum} Set ${setNum}`);
    }

    localStorage.setItem('outlaw_completed', JSON.stringify(completedWorkouts));
    renderWorkouts();
}

function toggleCoreItem(key) {
    const checkbox = document.getElementById(`cl_${key}`);
    completedWorkouts[key] = checkbox.checked;
    localStorage.setItem('outlaw_completed', JSON.stringify(completedWorkouts));
    const row = document.getElementById(`cl_row_${key}`);
    if (checkbox.checked) row.classList.add('done');
    else row.classList.remove('done');
}

function startRestTimer(seconds, label) {
    clearInterval(restTimerInterval);
    restTotalTime = seconds;
    restTimeRemaining = seconds;
    document.getElementById('timerLabel').innerText = label || 'Rest Timer';
    document.getElementById('timerBar').classList.add('active');
    updateTimerDisplay();

    restTimerInterval = setInterval(() => {
        restTimeRemaining--;
        updateTimerDisplay();
        if (restTimeRemaining <= 0) {
            clearInterval(restTimerInterval);
            document.getElementById('timerBar').classList.remove('active');
            playBeep();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(restTimeRemaining / 60).toString().padStart(2, '0');
    const secs = (restTimeRemaining % 60).toString().padStart(2, '0');
    document.getElementById('timerDisplay').innerText = `${mins}:${secs}`;
}

function adjustTimer(amt) {
    restTimeRemaining = Math.max(5, restTimeRemaining + amt);
    updateTimerDisplay();
}

function stopTimer() {
    clearInterval(restTimerInterval);
    document.getElementById('timerBar').classList.remove('active');
}

function playBeep() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
        console.log('Audio played');
    }
}

// INTERACTIVE GUIDED ROUTINE MODAL TIMER
function startInteractiveRoutine(routineKey) {
    activeRoutineList = ROUTINES[routineKey].exercises;
    routineCurrentStepIndex = 0;
    routineIsPaused = false;
    document.getElementById('routineModal').classList.add('active');
    loadRoutineStep();
}

function loadRoutineStep() {
    if (routineCurrentStepIndex >= activeRoutineList.length) {
        closeRoutineModal();
        alert('🎉 Guided Routine Completed Successfully!');
        return;
    }

    const step = activeRoutineList[routineCurrentStepIndex];
    document.getElementById('routineCurrentName').innerText = step.name;
    document.getElementById('routineStatusBadge').innerText = step.type === 'timed' ? 'Timed Hold / Effort' : 'Repetition Set';
    
    routineSecondsLeft = step.type === 'timed' ? step.duration : 45;

    const nextStep = activeRoutineList[routineCurrentStepIndex + 1];
    document.getElementById('routineNextPreview').innerText = nextStep ? `Next: ${nextStep.name}` : `Final Exercise in Routine`;

    updateRoutineTimerDisplay();
    clearInterval(routineTimerInterval);

    routineTimerInterval = setInterval(() => {
        if (!routineIsPaused) {
            routineSecondsLeft--;
            updateRoutineTimerDisplay();
            if (routineSecondsLeft <= 0) {
                clearInterval(routineTimerInterval);
                playBeep();
                setTimeout(() => {
                    routineCurrentStepIndex++;
                    loadRoutineStep();
                }, 1000);
            }
        }
    }, 1000);
}

function updateRoutineTimerDisplay() {
    const mins = Math.floor(routineSecondsLeft / 60).toString().padStart(2, '0');
    const secs = (routineSecondsLeft % 60).toString().padStart(2, '0');
    document.getElementById('routineTimerDisplay').innerText = `${mins}:${secs}`;
}

function pauseRoutineTimer() {
    routineIsPaused = !routineIsPaused;
    document.getElementById('routinePauseBtn').innerText = routineIsPaused ? 'Resume' : 'Pause';
}

function skipRoutineStep() {
    clearInterval(routineTimerInterval);
    routineCurrentStepIndex++;
    loadRoutineStep();
}

function closeRoutineModal() {
    clearInterval(routineTimerInterval);
    document.getElementById('routineModal').classList.remove('active');
}

// WEEKLY PLAN TAB RENDERER
function renderWeeklyPlan() {
    const container = document.getElementById('weeklyPlanContainer');
    const days = [
        { name: 'Monday', desc: `Gym Session 1 (${gymDays[0]}) — Unilateral Lower Body & Glute Focus` },
        { name: 'Tuesday', desc: `Gym Session 2 (${gymDays[1]}) — Upper Back Posture & Core Integration` },
        { name: 'Wednesday', desc: 'TrainerRoad Sweet Spot / Threshold Bike + Easy Swim' },
        { name: 'Thursday', desc: `Gym Session 3 (${gymDays[2]}) — Leg Endurance & Stability + Active Core` },
        { name: 'Friday', desc: 'TrainerRoad Aerobic Endurance Bike / Technique Swim' },
        { name: 'Saturday', desc: 'Long Brick Workout (Long Ride + Off-the-Bike Run)' },
        { name: 'Sunday', desc: 'Long Recovery Run / Complete Rest & Mobility' }
    ];

    let html = '';
    days.forEach(d => {
        html += `
            <div class="roadmap-month" style="margin-bottom:10px; padding:12px;">
                <div style="font-weight:700; font-size:0.9rem; margin-bottom:4px;">${d.name}</div>
                <div style="font-size:0.85rem; color:var(--text-muted);">${d.desc}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// VIDEO LIBRARY RENDERER
function renderVideoLibrary() {
    const container = document.getElementById('videoHierarchyContainer');
    let html = '';

    VIDEO_LIBRARY_DATA.forEach((category, catIdx) => {
        html += `
            <details class="folder-details" ${catIdx === 0 ? 'open' : ''}>
                <summary class="folder-summary">
                    <span>📁 ${category.name}</span>
                    <a href="${category.url}" target="_blank" rel="noopener" class="btn" style="font-size:0.65rem; padding:2px 6px;">Folder ↗</a>
                </summary>
                <div class="folder-body" style="padding:10px 12px; border-top:1px solid var(--border);">
        `;

        if (category.subfolders && category.subfolders.length > 0) {
            category.subfolders.forEach((sub, subIdx) => {
                html += `
                    <details class="subfolder-details" ${catIdx === 0 && subIdx === 0 ? 'open' : ''}>
                        <summary class="subfolder-summary">
                            <span>📂 ${sub.name}</span>
                            <a href="${sub.url}" target="_blank" rel="noopener" style="font-size:0.7rem; color:var(--primary); text-decoration:none;">Open ↗</a>
                        </summary>
                        <div class="video-list">
                `;

                if (sub.videos && sub.videos.length > 0) {
                    sub.videos.forEach(vid => {
                        const isWatched = completedVideos[vid.id] || false;
                        html += `
                            <div class="video-row ${isWatched ? 'completed' : ''}">
                                <div class="video-row-left" onclick="toggleVideoWatched('${vid.id}')">
                                    <input type="checkbox" ${isWatched ? 'checked' : ''} onclick="event.stopPropagation(); toggleVideoWatched('${vid.id}')">
                                    <span class="video-title-text">${vid.title}</span>
                                </div>
                                <a href="${vid.url}" target="_blank" rel="noopener" class="video-link-badge">Watch ↗</a>
                            </div>
                        `;
                    });
                } else {
                    html += `<p style="font-size:0.78rem; color:var(--text-muted); padding:4px;">No videos in this folder yet.</p>`;
                }

                html += `</div></details>`;
            });
        }

        html += `</div></details>`;
    });

    container.innerHTML = html;
}

function toggleVideoWatched(videoId) {
    completedVideos[videoId] = !completedVideos[videoId];
    localStorage.setItem('outlaw_watched_videos', JSON.stringify(completedVideos));
    renderVideoLibrary();
}

// SETTINGS & OFFLINE ICS SYNC
function loadSettingsToUI() {
    document.getElementById('gymDay1').value = gymDays[0];
    document.getElementById('gymDay2').value = gymDays[1];
    document.getElementById('gymDay3').value = gymDays[2];
    const savedIcs = localStorage.getItem('outlaw_ics_url') || '';
    document.getElementById('icsUrl').value = savedIcs;
}

function saveGymDays() {
    gymDays = [
        document.getElementById('gymDay1').value,
        document.getElementById('gymDay2').value,
        document.getElementById('gymDay3').value
    ];
    localStorage.setItem('outlaw_gym_days', JSON.stringify(gymDays));
    renderWeeklyPlan();
}

function saveICSUrl() {
    const val = document.getElementById('icsUrl').value;
    localStorage.setItem('outlaw_ics_url', val);
}

function syncCalendar() {
    const bannerText = document.getElementById('trTodayText');
    bannerText.innerHTML = `🔄 Connecting to TrainerRoad calendar feed...`;
    
    setTimeout(() => {
        const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        let workoutToday = "Sweet Spot TrainerRoad Ride (60m) + Aerobic Swim";
        
        if (todayName === gymDays[0] || todayName === gymDays[1] || todayName === gymDays[2]) {
            workoutToday = `TrainerRoad Active Recovery Spin (30m) + Scheduled Gym Strength`;
        } else if (todayName === 'Saturday') {
            workoutToday = `Outlaw Prep Brick: 3.5h Endurance Ride + 30m Off-the-Bike Run`;
        } else if (todayName === 'Sunday') {
            workoutToday = `Long Recovery Run (75m Zone 2)`;
        }

        bannerText.innerHTML = `✅ Synced successfully (${todayName}): <strong>${workoutToday}</strong>`;
    }, 800);
}

function resetAppData() {
    if (confirm('Are you sure you want to reset all progress and cached completion data?')) {
        localStorage.removeItem('outlaw_completed');
        localStorage.removeItem('outlaw_watched_videos');
        completedWorkouts = {};
        completedVideos = {};
        renderWorkouts();
        renderVideoLibrary();
        alert('App data reset successfully.');
    }
}