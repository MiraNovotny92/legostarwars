const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let isMuted = false;
let musicInterval = null;

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById("mute-btn");
    btn.innerText = isMuted ? "🔇 Sound Off" : "🔊 Sound On";
    if (isMuted && musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    } else if (!isMuted && gameState === "PLAYING") {
        startBackgroundMusic();
    }
}

// Play Sound Effects
function playSound(type) {
    if (isMuted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'jump') {
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);
        gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(); osc.stop(now + 0.12);
    } else if (type === 'stud') {
        osc.frequency.setValueAtTime(900, now); osc.frequency.setValueAtTime(1400, now + 0.06);
        gain.gain.setValueAtTime(0.12, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(); osc.stop(now + 0.12);
    } else if (type === 'shield') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
        gain.gain.setValueAtTime(0.25, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(); osc.stop(now + 0.25);
    } else if (type === 'r2d2') {
        osc.type = 'sine'; let freq = 800 + Math.random() * 800;
        osc.frequency.setValueAtTime(freq, now); osc.frequency.linearRampToValueAtTime(freq + 400, now + 0.08);
        gain.gain.setValueAtTime(0.18, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(); osc.stop(now + 0.2);
    } else if (type === 'gonk') {
        osc.type = 'square'; osc.frequency.setValueAtTime(110, now);
        gain.gain.setValueAtTime(0.25, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(); osc.stop(now + 0.25);
    } else if (type === 'bb8') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now); osc.frequency.linearRampToValueAtTime(1800, now + 0.06);
        gain.gain.setValueAtTime(0.18, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(); osc.stop(now + 0.15);
    } else if (type === 'mouse') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now); osc.frequency.linearRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.12, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(); osc.stop(now + 0.12);
    } else if (type === 'win') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(659, now + 0.3);
        gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.start(); osc.stop(now + 0.5);
    }
}

// Procedural Chiptune Star Wars Main Fanfare Loop
function startBackgroundMusic() {
    if (musicInterval || isMuted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const notes = [261.63, 392.00, 349.23, 329.63, 293.66, 523.25, 392.00, 349.23, 329.63, 293.66, 523.25, 392.00];
    let noteIdx = 0;

    musicInterval = setInterval(() => {
        if (gameState !== "PLAYING" || isMuted) {
            clearInterval(musicInterval);
            musicInterval = null;
            return;
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[noteIdx], audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.25);

        noteIdx = (noteIdx + 1) % notes.length;
    }, 400);
}
