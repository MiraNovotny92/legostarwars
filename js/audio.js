window.audioCtx = null;
try {
    window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
} catch(e) {
    console.warn("Web Audio API not supported on this browser.");
}

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
    } else if (window.GAME.state === "PLAYING") {
        bgMusic.play().catch(() => {});
    }
};

window.startBackgroundMusic = function() {
    if (isMuted) return;
    bgMusic.play().catch(() => {});
};

window.playSound = function(type) {
    if (isMuted || !window.audioCtx) return;
    if (window.audioCtx.state === 'suspended') window.audioCtx.resume().catch(() => {});
    
    try {
        const now = window.audioCtx.currentTime;

        if (type === 'jump') {
            const osc = window.audioCtx.createOscillator(); const gain = window.audioCtx.createGain();
            osc.connect(gain); gain.connect(window.audioCtx.destination);
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);
            gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
            osc.start(); osc.stop(now + 0.12);
        } else if (type === 'stud') {
            const osc = window.audioCtx.createOscillator(); const gain = window.audioCtx.createGain();
            osc.connect(gain); gain.connect(window.audioCtx.destination);
            osc.frequency.setValueAtTime(900, now); osc.frequency.setValueAtTime(1400, now + 0.06);
            gain.gain.setValueAtTime(0.12, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
            osc.start(); osc.stop(now + 0.12);
        } else if (type === 'slash') {
            const osc1 = window.audioCtx.createOscillator(); const gain1 = window.audioCtx.createGain();
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(480, now);
            osc1.frequency.exponentialRampToValueAtTime(140, now + 0.18);
            gain1.gain.setValueAtTime(0.25, now); gain1.gain.linearRampToValueAtTime(0.01, now + 0.18);
            osc1.connect(gain1); gain1.connect(window.audioCtx.destination);
            osc1.start(); osc1.stop(now + 0.18);

            const osc2 = window.audioCtx.createOscillator(); const gain2 = window.audioCtx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(110, now);
            osc2.frequency.linearRampToValueAtTime(80, now + 0.18);
            gain2.gain.setValueAtTime(0.2, now); gain2.gain.linearRampToValueAtTime(0.01, now + 0.18);
            osc2.connect(gain2); gain2.connect(window.audioCtx.destination);
            osc2.start(); osc2.stop(now + 0.18);
        } else if (type === 'gateBreak') {
            const osc = window.audioCtx.createOscillator(); const gain = window.audioCtx.createGain();
            osc.connect(gain); gain.connect(window.audioCtx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.linearRampToValueAtTime(60, now + 0.22);
            gain.gain.setValueAtTime(0.35, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
            osc.start(); osc.stop(now + 0.22);
        } else if (type === 'shield') {
            const osc = window.audioCtx.createOscillator(); const gain = window.audioCtx.createGain();
            osc.connect(gain); gain.connect(window.audioCtx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
            gain.gain.setValueAtTime(0.25, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
            osc.start(); osc.stop(now + 0.25);
        } else if (type === 'win') {
            const osc = window.audioCtx.createOscillator(); const gain = window.audioCtx.createGain();
            osc.connect(gain); gain.connect(window.audioCtx.destination);
            osc.type = 'triangle'; osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(659, now + 0.3);
            gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
            osc.start(); osc.stop(now + 0.5);
        }
    } catch(e) {}
};
