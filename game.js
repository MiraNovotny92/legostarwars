// Render Textured Ground Platforms
function drawLegoPlatform(p) {
    let img = ASSETS['ground'];

    if (img && img.complete && img.naturalWidth !== 0) {
        // Repeat PNG pattern across platform width
        let pattern = ctx.createPattern(img, 'repeat');
        ctx.fillStyle = pattern;
        ctx.beginPath(); ctx.roundRect(p.x, p.y, p.width, p.height, 6); ctx.fill();
    } else {
        // High Quality Cartoon Gradient Platform
        let grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
        grad.addColorStop(0, p.isMoving ? "#e67e22" : "#2ecc71");
        grad.addColorStop(0.2, "#2c3e50");
        grad.addColorStop(1, "#1a252f");
        
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.roundRect(p.x, p.y, p.width, p.height, 8); ctx.fill();

        // 3D Lego Stud Highlights
        let studSpacing = 22;
        let studCount = Math.floor(p.width / studSpacing);
        for (let i = 0; i < studCount; i++) {
            let sx = p.x + (i * studSpacing) + 11;
            let sy = p.y - 4;
            ctx.fillStyle = p.isMoving ? "#f39c12" : "#27ae60";
            ctx.fillRect(sx - 5, sy, 10, 4);
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.fillRect(sx - 5, sy, 10, 1);
        }
    }
}

// Render Trees / Scenery
function drawVaporator(v) {
    let img = ASSETS['tree'];
    if (img && img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, v.x - 20, v.y, v.width + 40, v.height);
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

// Main Render Loop
function draw() {
    // Rich Multi-Tone Nebula Sky
    let bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, "#090a14"); bgGrad.addColorStop(0.5, "#160e2e"); bgGrad.addColorStop(1, "#281140");
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save(); 
    let shakeX = (Math.random() - 0.5) * camera.shake;
    let shakeY = (Math.random() - 0.5) * camera.shake;
    ctx.translate(-camera.x + shakeX, shakeY);

    // Parallax Starfield
    stars.forEach(s => {
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    // Plasma Water Pits
    waterPits.forEach(wp => {
        ctx.fillStyle = "#00d2d3"; ctx.shadowBlur = 15; ctx.shadowColor = "#00d2d3";
        ctx.fillRect(wp.x, wp.y, wp.width, 100);
        ctx.fillStyle = "#54a0ff";
        ctx.fillRect(wp.x, wp.y + Math.sin(Date.now()/200)*3, wp.width, 6);
        ctx.shadowBlur = 0;
    });

    vaporators.forEach(v => drawVaporator(v));
    platforms.concat(movingPlatforms).forEach(p => drawLegoPlatform(p));

    forceContainers.forEach(fc => drawForceObject(ctx, fc));
    crates.forEach(c => drawForceObject(ctx, c));
    
    // Glowing Lego Studs
    studs.forEach(s => {
        if (!s.collected) {
            ctx.shadowBlur = 10; ctx.shadowColor = s.color;
            ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s.x - 2, s.y - 2, 2.5, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    kyberCrystals.forEach(kc => {
        if (!kc.collected) {
            ctx.shadowBlur = 15; ctx.shadowColor = "#00bfff";
            ctx.fillStyle = "#00bfff"; ctx.beginPath();
            ctx.moveTo(kc.x, kc.y); ctx.lineTo(kc.x + 10, kc.y - 15);
            ctx.lineTo(kc.x + 20, kc.y); ctx.lineTo(kc.x + 10, kc.y + 15); ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    droids.forEach(d => drawDroid(ctx, d));
    jumpPads.forEach(pad => { ctx.fillStyle = pad.color; ctx.fillRect(pad.x, pad.y, pad.width, pad.height); });

    if (currentMission === 1) {
        if (obiImg.complete && obiImg.naturalWidth !== 0) ctx.drawImage(obiImg, obi.x, obi.y, obi.width, obi.height);
        if (!hasLightsaber) {
            ctx.fillStyle = "#2ecc71"; ctx.shadowBlur = 15; ctx.shadowColor = "#2ecc71";
            ctx.fillRect(lightsaber.x, lightsaber.y + Math.sin(Date.now() / 150) * 8, lightsaber.width, lightsaber.height);
            ctx.shadowBlur = 0;
        }
    }

    if (currentMission === 3) drawGrogu(ctx, worldWidth - 400, 480);

    particles.forEach(p => {
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    });

    // Player Render
    ctx.save();
    ctx.translate(player.x + player.width/2, player.y + player.height);
    ctx.scale(player.scaleX, player.scaleY);

    if (hasShield) {
        ctx.strokeStyle = "#00bfff"; ctx.lineWidth = 4; ctx.shadowBlur = 15; ctx.shadowColor = "#00bfff";
        ctx.beginPath(); ctx.arc(0, -player.height/2, player.width/1.2, 0, Math.PI*2); ctx.stroke();
        ctx.shadowBlur = 0;
    }

    let pImg = player.facing === 'left' ? jediLeftImg : jediRightImg;
    let currentChar = CHARACTERS[selectedCharKey];

    if (pImg.complete && pImg.naturalWidth !== 0) {
        ctx.drawImage(pImg, -player.width/2, -player.height, player.width, player.height);
    } else {
        ctx.fillStyle = currentChar.color;
        ctx.fillRect(-player.width/2 + 8, -player.height + 15, player.width - 16, 20);
        ctx.fillStyle = "#f1c40f";
        ctx.beginPath(); ctx.arc(0, -player.height + 10, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(-player.width/2 + 10, -player.height + 35, player.width - 20, 13);
    }
    ctx.restore();

    ctx.restore();

    if (deathMessageTimer > 0) {
        ctx.fillStyle = "#e74c3c"; ctx.font = "bold 28px 'Comic Sans MS'";
        ctx.fillText("Oops! Respawning safe...", canvas.width/2 - 140, 200);
    }
}
