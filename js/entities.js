// Polyfill Canvas roundRect for older mobile browsers
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
        if (!radii) radii = 5;
        let r = typeof radii === 'number' ? radii : radii[0] || 5;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

// Asset Dictionary Cache
const ASSETS = {};
function loadGameAsset(key, src) {
    ASSETS[key] = new Image();
    ASSETS[key].src = src;
}

loadGameAsset('ground', 'assets/ground_tile.png');
loadGameAsset('crate', 'assets/crate.png');
loadGameAsset('tree', 'assets/tree.png');
loadGameAsset('grogu', 'assets/grogu.png');
loadGameAsset('speeder', 'assets/speeder.png');
loadGameAsset('r2d2', 'assets/r2d2.png');
loadGameAsset('bb8', 'assets/bb8.png');
loadGameAsset('gonk', 'assets/gonk.png');

// Render Force Liftable Objects
function drawForceObject(ctx, obj) {
    ctx.save();
    
    if (obj.isHovering) {
        ctx.strokeStyle = "#e0aaff"; ctx.lineWidth = 5;
        ctx.shadowBlur = 25; ctx.shadowColor = "#e0aaff";
        ctx.strokeRect(obj.x - 4, obj.y - 4, obj.width + 8, obj.height + 8);
        ctx.shadowBlur = 0;
    }

    let spriteKey = obj.type === 'speeder' ? 'speeder' : 'crate';
    let img = ASSETS[spriteKey];

    if (img && img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
    } else {
        // High-Contrast Textured Cartoon Vector Art
        if (obj.type === 'speeder') {
            ctx.fillStyle = "#e67e22"; ctx.fillRect(obj.x, obj.y + 15, obj.width, 15);
            ctx.fillStyle = "#e74c3c"; ctx.fillRect(obj.x + 20, obj.y + 5, 25, 10);
            ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.strokeRect(obj.x, obj.y + 15, obj.width, 15);
        } else {
            let grad = ctx.createLinearGradient(obj.x, obj.y, obj.x + obj.width, obj.y + obj.height);
            grad.addColorStop(0, "#f39c12"); grad.addColorStop(1, "#d35400");
            ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(obj.x, obj.y, obj.width, obj.height, 8); ctx.fill();
            ctx.strokeStyle = "#000"; ctx.lineWidth = 3.5; ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
            ctx.fillStyle = "#fff"; ctx.fillRect(obj.x + 6, obj.y + 6, obj.width - 12, 6);
        }
    }

    ctx.restore();
}

// Render Cute Illustrated Grogu
function drawGrogu(ctx, x, y) {
    ctx.save();
    let img = ASSETS['grogu'];
    let floatY = y + Math.sin(Date.now() / 200) * 6;

    if (img && img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, x - 40, floatY - 40, 80, 80);
    } else {
        // Hand-Drawn Illustrated Vector Art
        ctx.fillStyle = "#bdc3c7"; ctx.beginPath(); ctx.arc(x, floatY, 32, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = "#7f8c8d"; ctx.beginPath(); ctx.arc(x, floatY - 5, 26, Math.PI, 0); ctx.fill();

        ctx.shadowBlur = 15; ctx.shadowColor = "#00bfff";
        ctx.fillStyle = "#00bfff"; ctx.beginPath(); ctx.arc(x, floatY + 28, 8, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        let earWiggle = Math.sin(Date.now() / 250) * 0.15;
        ctx.fillStyle = "#2ecc71";
        ctx.beginPath(); ctx.ellipse(x - 24, floatY - 12, 16, 6, -0.3 + earWiggle, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + 24, floatY - 12, 16, 6, 0.3 - earWiggle, 0, Math.PI * 2); ctx.fill();

        ctx.beginPath(); ctx.arc(x, floatY - 12, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#000";
        ctx.beginPath(); ctx.arc(x - 5, floatY - 13, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 5, floatY - 13, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(x - 6, floatY - 14, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 4, floatY - 14, 1, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = "#f39c12"; ctx.beginPath(); ctx.roundRect(x - 12, floatY - 2, 24, 10, 4); ctx.fill();
    }

    ctx.restore();
}

// Render Droids
function drawDroid(ctx, d) {
    let drawY = d.y - d.bounceY;

    if (d.isFloating) {
        ctx.shadowBlur = 20; ctx.shadowColor = "#e0aaff";
        ctx.strokeStyle = "#e0aaff"; ctx.lineWidth = 4;
        ctx.strokeRect(d.x - 4, drawY - 4, d.width + 8, d.height + 8);
        ctx.shadowBlur = 0;
    }

    let img = ASSETS[d.type];
    if (img && img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, d.x, drawY, d.width, d.height);
    } else {
        if (d.type === 'r2d2') {
            ctx.fillStyle = "#ecf0f1"; ctx.beginPath(); ctx.roundRect(d.x, drawY, d.width, d.height, [18,18,4,4]); ctx.fill();
            ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.stroke();
            ctx.fillStyle = "#2980b9"; ctx.fillRect(d.x + 8, drawY + 12, 24, 8);
            ctx.fillStyle = "#e74c3c"; ctx.beginPath(); ctx.arc(d.x + 20, drawY + 16, 3, 0, Math.PI*2); ctx.fill();
        } else if (d.type === 'gonk') {
            ctx.fillStyle = "#f39c12"; ctx.beginPath(); ctx.roundRect(d.x, drawY, d.width, d.height, 4); ctx.fill();
            ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.stroke();
            ctx.fillStyle = "#2c3e50"; ctx.fillRect(d.x + 5, drawY + 20, d.width - 10, 4);
        } else if (d.type === 'bb8') {
            ctx.fillStyle = "#ecf0f1"; ctx.beginPath(); ctx.arc(d.x + 20, drawY + 28, 16, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = "#e67e22"; ctx.lineWidth = 3; ctx.stroke();
            ctx.fillStyle = "#ecf0f1"; ctx.beginPath(); ctx.arc(d.x + 20, drawY + 10, 10, Math.PI, 0); ctx.fill();
        } else if (d.type === 'mouse') {
            ctx.fillStyle = "#34495e"; ctx.beginPath(); ctx.roundRect(d.x, drawY + 20, d.width, d.height - 20, [8,8,2,2]); ctx.fill();
            ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.stroke();
        }
    }

    if (d.textTimer > 0 || d.isFloating) {
        ctx.fillStyle = "#fff"; ctx.font = "bold 14px 'Comic Sans MS'";
        ctx.fillText(d.isFloating ? "Woah!! 🌀" : d.label, d.x - 10, drawY - 10);
    }
}
