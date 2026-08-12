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
        ctx.fillStyle = "#1e272e";
        drawRoundedRect(ctx, b.x, b.y, b.width, b.height, 12);
        ctx.strokeStyle = "#485460"; ctx.lineWidth = 4; ctx.strokeRect(b.x + 10, b.y + 10, b.width - 20, b.height - 10);
        ctx.fillStyle = "#2c3e50"; ctx.fillRect(b.x + b.width/2 - 30, b.y + b.height - 70, 60, 70);
        ctx.shadowBlur = 15; ctx.shadowColor = "#ff0000";
        ctx.fillStyle = "#ff0000"; ctx.fillRect(b.x + b.width/2 - 25, b.y + b.height - 65, 50, 6);
        ctx.shadowBlur = 0;
    } else {
        ctx.fillStyle = "#d35400";
        drawRoundedRect(ctx, b.x, b.y, b.width, b.height, 10);
        ctx.fillStyle = "#e67e22";
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
    
    // Gate Side Pillars
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(gate.x - 10, gate.y, 12, gate.height);
    ctx.fillRect(gate.x + gate.width - 2, gate.y, 12, gate.height);
    
    // Glowing Laser Beams
    ctx.shadowBlur = 25; 
    ctx.shadowColor = "#ff0055";
    ctx.fillStyle = "#ff0055";
    for (let i = 15; i < gate.height - 10; i += 24) {
        ctx.fillRect(gate.x + 2, gate.y + i, gate.width - 4, 10);
    }
    ctx.shadowBlur = 0;

    // Glowing Prominent Text Prompt
    ctx.fillStyle = "#ffd700"; 
    ctx.font = "bold 16px 'Comic Sans MS'";
    ctx.textAlign = "center";
    ctx.fillText("⚡ SLASH [D]! ⚡", gate.x + gate.width / 2, gate.y - 15);
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
        let grad = ctx.createLinearGradient(obj.x, obj.y, obj.x + obj.width, obj.y + obj.height);
        grad.addColorStop(0, "#f39c12"); grad.addColorStop(1, "#d35400");
        ctx.fillStyle = grad;
        drawRoundedRect(ctx, obj.x, obj.y, obj.width, obj.height, 8);
        ctx.strokeStyle = "#000"; ctx.lineWidth = 3.5; ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
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
    }
    ctx.restore();
}

function drawDroid(ctx, d) {
    let drawY = d.y - (d.bounceY || 0);
    let img = ASSETS[d.type];
    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        ctx.drawImage(img, d.x, drawY, d.width, d.height);
    } else {
        ctx.fillStyle = "#ecf0f1"; drawRoundedRect(ctx, d.x, drawY, d.width, d.height, 8);
        ctx.strokeStyle = "#000"; ctx.lineWidth = 3; ctx.stroke();
    }
}
