const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let isMuted = false;

const bgMusic = new Audio('assets/theme.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.35;

window.toggleMute = function() {
    isMuted = !isMuted;
    const btn = document.getElementById("mute-btn");
    if (btn) btn.innerText = isMuted ? "🔇 Sound Off" : "🔊 Sound On";
    
    if (isMuted) {
        bgMusic.pause();
    } else if (GAME.state === "PLAYING") {
        bgMusic.play().catch(() => {});
    }
};

function startBackgroundMusic() {
    if (isMuted) return;
    bgMusic.play().catch(() => {});
}

function playSound(type) {
    if (isMuted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    
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
    } else if (type === 'r2d2' || type === 'bb8') {
        osc.type = 'sine'; let freq = 800 + Math.random() * 800;
        osc.frequency.setValueAtTime(freq, now); osc.frequency.linearRampToValueAtTime(freq + 400, now + 0.08);
        gain.gain.setValueAtTime(0.18, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(); osc.stop(now + 0.2);
    } else if (type === 'gonk' || type === 'mouse') {
        osc.type = 'square'; osc.frequency.setValueAtTime(110, now);
        gain.gain.setValueAtTime(0.25, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(); osc.stop(now + 0.25);
    } else if (type === 'win') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(659, now + 0.3);
        gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.start(); osc.stop(now + 0.5);
    }
}
