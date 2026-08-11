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

function drawVaporator(ctx, v) {
    let img = ASSETS['tree'];
    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        let aspect = img.naturalWidth / img.naturalHeight;
        if (!isFinite(aspect) || aspect <= 0) aspect = 0.5;
        let drawWidth = v.height * aspect;
        ctx.drawImage(img, v.x - (drawWidth - v.width)/2, v.y, drawWidth, v.height);
        ctx.restore();
    } else {
        ctx.fillStyle = "#7f8c8d"; ctx.fillRect(v.x + 10, v.y + 30, 4, v.height - 30);
        ctx.fillStyle = "#bdc3c7";
        ctx.fillRect(v.x + 2, v.y + 40, 20, 8);
        ctx.fillRect(v.x + 4, v.y + 70, 16, 8);
        ctx.fillStyle = "#34495e"; ctx.fillRect(v.x + 6, v.y, 12, 30);
        ctx.shadowBlur = 12; ctx.shadowColor = "#00bfff";
        ctx.fillStyle = "#00bfff"; ctx.fillRect(v.x + 8, v.y + 10, 8, 10);
        ctx.shadowBlur = 0;
    }
}

function drawBuilding(ctx, b) {
    ctx.save();
    if (b.type === 'imperial') {
        ctx.fillStyle = "#2c3e50";
        drawRoundedRect(ctx, b.x, b.y, b.width, b.height, 12);
        ctx.strokeStyle = "#00bfff"; ctx.lineWidth = 4; ctx.strokeRect(b.x + 10, b.y + 10, b.width - 20, b.height - 10);

        ctx.fillStyle = "#1e272e"; ctx.fillRect(b.x + b.width/2 - 30, b.y + b.height - 70, 60, 70);
        ctx.shadowBlur = 15; ctx.shadowColor = "#ff0000";
        ctx.fillStyle = "#ff0000"; ctx.fillRect(b.x + b.width/2 - 25, b.y + b.height - 65, 50, 6);
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#bdc3c7"; ctx.fillRect(b.x + 30, b.y - 40, 6, 40);
        ctx.fillStyle = "#ff0000"; ctx.beginPath(); ctx.arc(b.x + 33, b.y - 40, 6, 0, Math.PI*2); ctx.fill();
    } else {
        ctx.fillStyle = "#d35400";
        drawRoundedRect(ctx, b.x, b.y, b.width, b.height, 10);
        ctx.fillStyle = "#f39c12";
        ctx.fillRect(b.x + 15, b.y + 20, 20, b.height - 20);
        ctx.fillRect(b.x + b.width - 35, b.y + 20, 20, b.height - 20);

        ctx.shadowBlur = 20; ctx.shadowColor = "#00bfff";
        ctx.fillStyle = "#00bfff"; ctx.beginPath();
        ctx.arc(b.x + b.width/2, b.y + 40, 15, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
    }
    ctx.restore();
}

function drawLaserGate(ctx, gate) {
    if (gate.destroyed) return;
    ctx.save();
    
    ctx.fillStyle = "#bdc3c7";
    ctx.fillRect(gate.x - 8, gate.y, 12, gate.height);
    ctx.fillRect(gate.x + gate.width - 4, gate.y, 12, gate.height);
    ctx.strokeStyle = "#000"; ctx.lineWidth = 2.5;
    ctx.strokeRect(gate.x - 8, gate.y, 12, gate.height);
    ctx.strokeRect(gate.x + gate.width - 4, gate.y, 12, gate.height);

    ctx.shadowBlur = 20; ctx.shadowColor = "#ff0055";
    ctx.fillStyle = "#ff0055";
    for (let i = 15; i < gate.height - 10; i += 22) {
        ctx.fillRect(gate.x + 4, gate.y + i, gate.width - 8, 8);
    }
    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawNPC(ctx, npc) {
    let drawY = npc.y - (npc.bounceY || 0);
    ctx.save();
    if (npc.type === 'jawa') {
        ctx.fillStyle = "#784212"; drawRoundedRect(ctx, npc.x, drawY + 10, npc.width, npc.height - 10, 8);
        ctx.fillStyle = "#1c2833"; ctx.beginPath(); ctx.arc(npc.x + 18, drawY + 16, 8, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 12; ctx.shadowColor = "#f1c40f";
        ctx.fillStyle = "#f1c40f";
        ctx.beginPath(); ctx.arc(npc.x + 15, drawY + 16, 2.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(npc.x + 21, drawY + 16, 2.5, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
    } else if (npc.type === 'rebel') {
        ctx.fillStyle = "#27ae60"; drawRoundedRect(ctx, npc.x + 5, drawY + 15, npc.width - 10, npc.height - 15, 4);
        ctx.fillStyle = "#ecf0f1"; drawRoundedRect(ctx, npc.x + 4, drawY, npc.width - 8, 14, 4);
        ctx.fillStyle = "#f1c40f"; ctx.beginPath(); ctx.arc(npc.x + 18, drawY + 18, 6, 0, Math.PI*2); ctx.fill();
    }

    if (npc.textTimer > 0) {
        ctx.fillStyle = "#fff"; ctx.font = "bold 14px 'Comic Sans MS'";
        ctx.fillText(npc.label, npc.x - 10, drawY - 10);
    }
    ctx.restore();
}

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

    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
    } else {
        if (obj.type === 'speeder') {
            ctx.fillStyle = "#e67e22"; ctx.fillRect(obj.x, obj.y + 15, obj.width, 15);
            ctx.fillStyle = "#e74c3c"; ctx.fillRect(obj.x + 20, obj.y + 5, 25, 10);
            ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.strokeRect(obj.x, obj.y + 15, obj.width, 15);
        } else {
            let grad = ctx.createLinearGradient(obj.x, obj.y, obj.x + obj.width, obj.y + obj.height);
            grad.addColorStop(0, "#f39c12"); grad.addColorStop(1, "#d35400");
            ctx.fillStyle = grad;
            drawRoundedRect(ctx, obj.x, obj.y, obj.width, obj.height, 8);
            ctx.strokeStyle = "#000"; ctx.lineWidth = 3.5; ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
        }
    }
    ctx.restore();
}

function drawGrogu(ctx, x, y) {
    ctx.save();
    let img = ASSETS['grogu'];
    let floatY = y + Math.sin(Date.now() / 200) * 6;

    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        ctx.drawImage(img, x - 40, floatY - 40, 80, 80);
    } else {
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

        ctx.fillStyle = "#f39c12"; drawRoundedRect(ctx, x - 12, floatY - 2, 24, 10, 4);
    }
    ctx.restore();
}

function drawDroid(ctx, d) {
    let drawY = d.y - (d.bounceY || 0);

    if (d.isFloating) {
        ctx.shadowBlur = 20; ctx.shadowColor = "#e0aaff";
        ctx.strokeStyle = "#e0aaff"; ctx.lineWidth = 4;
        ctx.strokeRect(d.x - 4, drawY - 4, d.width + 8, d.height + 8);
        ctx.shadowBlur = 0;
    }

    let img = ASSETS[d.type];
    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        ctx.drawImage(img, d.x, drawY, d.width, d.height);
    } else {
        if (d.type === 'r2d2') {
            ctx.fillStyle = "#ecf0f1"; drawRoundedRect(ctx, d.x, drawY, d.width, d.height, 8);
            ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.stroke();
            ctx.fillStyle = "#2980b9"; ctx.fillRect(d.x + 8, drawY + 12, 24, 8);
            ctx.fillStyle = "#e74c3c"; ctx.beginPath(); ctx.arc(d.x + 20, drawY + 16, 3, 0, Math.PI*2); ctx.fill();
        } else if (d.type === 'gonk') {
            ctx.fillStyle = "#f39c12"; drawRoundedRect(ctx, d.x, drawY, d.width, d.height, 4);
            ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.stroke();
            ctx.fillStyle = "#2c3e50"; ctx.fillRect(d.x + 5, drawY + 20, d.width - 10, 4);
        } else if (d.type === 'bb8') {
            ctx.fillStyle = "#ecf0f1"; ctx.beginPath(); ctx.arc(d.x + 20, drawY + 28, 16, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = "#e67e22"; ctx.lineWidth = 3; ctx.stroke();
            ctx.fillStyle = "#ecf0f1"; ctx.beginPath(); ctx.arc(d.x + 20, drawY + 10, 10, Math.PI, 0); ctx.fill();
        } else if (d.type === 'mouse') {
            ctx.fillStyle = "#34495e"; drawRoundedRect(ctx, d.x, drawY + 20, d.width, d.height - 20, 4);
            ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.stroke();
        }
    }

    if (d.textTimer > 0 || d.isFloating) {
        ctx.fillStyle = "#fff"; ctx.font = "bold 14px 'Comic Sans MS'";
        ctx.fillText(d.isFloating ? "Woah!! 🌀" : d.label, d.x - 10, drawY - 10);
    }
}
