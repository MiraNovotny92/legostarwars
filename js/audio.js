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
    
    const now = audioCtx.currentTime;

    if (type === 'jump') {
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);
        gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(); osc.stop(now + 0.12);
    } else if (type === 'stud') {
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(900, now); osc.frequency.setValueAtTime(1400, now + 0.06);
        gain.gain.setValueAtTime(0.12, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(); osc.stop(now + 0.12);
    } else if (type === 'slash') {
        // Dual-Oscillator Lightsaber Whoosh & Hum
        const osc1 = audioCtx.createOscillator(); const gain1 = audioCtx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(480, now);
        osc1.frequency.exponentialRampToValueAtTime(140, now + 0.18);
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.linearRampToValueAtTime(0.01, now + 0.18);
        osc1.connect(gain1); gain1.connect(audioCtx.destination);
        osc1.start(); osc1.stop(now + 0.18);

        const osc2 = audioCtx.createOscillator(); const gain2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(110, now);
        osc2.frequency.linearRampToValueAtTime(80, now + 0.18);
        gain2.gain.setValueAtTime(0.2, now);
        gain2.gain.linearRampToValueAtTime(0.01, now + 0.18);
        osc2.connect(gain2); gain2.connect(audioCtx.destination);
        osc2.start(); osc2.stop(now + 0.18);
    } else if (type === 'gateBreak') {
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.22);
        gain.gain.setValueAtTime(0.35, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
        osc.start(); osc.stop(now + 0.22);
    } else if (type === 'shield') {
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
        gain.gain.setValueAtTime(0.25, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(); osc.stop(now + 0.25);
    } else if (type === 'r2d2' || type === 'bb8') {
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'sine'; let freq = 800 + Math.random() * 800;
        osc.frequency.setValueAtTime(freq, now); osc.frequency.linearRampToValueAtTime(freq + 400, now + 0.08);
        gain.gain.setValueAtTime(0.18, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(); osc.stop(now + 0.2);
    } else if (type === 'gonk' || type === 'mouse') {
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'square'; osc.frequency.setValueAtTime(110, now);
        gain.gain.setValueAtTime(0.25, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(); osc.stop(now + 0.25);
    } else if (type === 'win') {
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'triangle'; osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(659, now + 0.3);
        gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.start(); osc.stop(now + 0.5);
    }
}
