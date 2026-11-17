// ROUTINE DEFINITIONS (Routine 1 & Routine 2)
const ROUTINES = {
    routine1: {
        name: "Routine 1 Scientific Triathlon",
        exercises: [
            { name: "Front Plank", type: "timed", duration: 60, notes: "Forearms on floor, glutes squeezed hard, neutral lower back." },
            { name: "Side Plank (Left)", type: "timed", duration: 45, notes: "Stack feet or stagger; lift hips high, lateral oblique engagement." },
            { name: "Side Plank (Right)", type: "timed", duration: 45, notes: "Mirror image on right side." },
            { name: "Glute bridge", type: "timed", duration: 60, notes: "Alternate slow extensions" },
            { name: "Hurdles (Left)", type: "timed", duration: 60, notes: "Hip mobility" },
            { name: "Hurdles (Right)", type: "timed", duration: 60, notes: "Hip Mobility" },
            { name: "Superman Back Lifts", type: "timed", duration: 60, notes: "Alternate slow extensions" },
            { name: "RDL (Left)", type: "timed", duration: 60, notes: "Balance" },
            { name: "RDL (Right)", type: "timed", duration: 60, notes: "Balance" },
            { name: "Running man", type: "timed", duration: 20, notes: "Finish" },
            { name: "Flutter", type: "timed", duration: 20, notes: "Finish" },
            { name: "V Kicks", type: "timed", duration: 20, notes: "Finish" }           
        ]
    },
    routine2: {
        name: "Routine 2 (Dynamic Core & Rotation)",
        exercises: [
            { name: "Pallof Press (Resistance Band)", type: "reps", sets: 3, reps: "12 / side", notes: "Anti-rotation hold for 2s at extension." },
            { name: "Russian Twists (Controlled)", type: "reps", sets: 3, reps: "20 total", notes: "Optional light weight, focus on thoracic rotation." },
            { name: "Single-Leg Glute Bridge Hold", type: "timed", duration: 45, notes: "Per leg, pelvis level, squeeze glutes." },
            { name: "Hollow Body Hold", type: "timed", duration: 30, notes: "Lower back glued to floor, arms/legs extended." },
            { name: "Mountain Climbers (Slow & Controlled)", type: "timed", duration: 45, notes: "Steady pace, core braced, no hip bouncing." }
        ]
    }
};

// STRENGTH SESSIONS CONFIGURATION (Deadlift-free, Tri-focused)
const STRENGTH_SESSIONS = {
    1: {
        title: "Session 1: Unilateral Lower & Glutes",
        subtitle: "Monday Gym Session",
        exercises: [
            { id: "s1_ex1", name: "Bulgarian Split Squats", meta: "3 Sets × 8-10 reps / leg", notes: "Elevated rear foot, upright torso for quad/glute drive.", sets: 4 },
            { id: "s1_ex2", name: "Single-Leg Romanian Deadlift (DB)", meta: "3 Sets × 10 reps / leg", notes: "Hinge at hip, flat back, hamstring & glute focus without axial heavy load.", sets: 4 },
            { id: "s1_ex3", name: "Walking Lunges", meta: "3 Sets × 12 steps / leg", notes: "Controlled knee tracking, upright posture.", sets: 3 },
            { id: "s1_ex4", name: "Calf Raises (Single Leg)", meta: "3 Sets × 15 reps / leg", notes: "Full range of motion off step edge.", sets: 3 }
        ]
    },
    2: {
        title: "Session 2: Upper Posture & Core Integration",
        subtitle: "Tuesday Gym Session",
        exercises: [
            { id: "s2_ex1", name: "Single-Arm Dumbbell Row", meta: "3 Sets × 10 reps / side", notes: "Support on bench, pull to hip for aero posture strength.", sets: 4 },
            { id: "s2_ex2", name: "Half-Kneeling Overhead Press", meta: "3 Sets × 8 reps / side", notes: "Core braced, strict vertical press.", sets: 3 },
            { id: "s2_ex3", name: "Lat Pulldown or Pull-Ups", meta: "3 Sets × 10 reps", notes: "Controlled eccentric return.", sets: 3 },
            { id: "s2_ex4", name: "Face Pulls", meta: "3 Sets × 15 reps", notes: "Rear delt and rotator cuff durability for TT position.", sets: 3 }
        ]
    },
    3: {
        title: "Session 3: Leg Endurance & Stability",
        subtitle: "Thursday Gym Session",
        exercises: [
            { id: "s3_ex1", name: "Goblet Squat (Deep Pause)", meta: "3 Sets × 10 reps", notes: "2-second pause at bottom, upright chest.", sets: 4 },
            { id: "s3_ex2", name: "Step-Ups onto Box", meta: "3 Sets × 10 reps / leg", notes: "Drive through heel, controlled descent.", sets: 3 },
            { id: "s3_ex3", name: "Cossack Squats / Lateral Lunges", meta: "3 Sets × 8 reps / side", notes: "Mobility and lateral knee stability.", sets: 3 },
            { id: "s3_ex4", name: "Single-Leg Balance & Reach", meta: "3 Sets × 30s / leg", notes: "Proprioception and ankle stability.", sets: 3 }
        ]
    }
};
