// Render Liftable Force Objects (Cargo Containers, Speeder Bikes, Lego Bricks)
function drawForceObject(ctx, obj) {
    ctx.save();
    
    if (obj.isHovering) {
        ctx.strokeStyle = "#e0aaff"; ctx.lineWidth = 4;
        ctx.shadowBlur = 20; ctx.shadowColor = "#e0aaff";
        ctx.strokeRect(obj.x - 4, obj.y - 4, obj.width + 8, obj.height + 8);
        ctx.shadowBlur = 0;
    }

    if (obj.type === 'speeder') {
        // Lego Speeder Bike
        ctx.fillStyle = "#7f8c8d"; ctx.fillRect(obj.x, obj.y + 15, obj.width, 15);
        ctx.fillStyle = "#e74c3c"; ctx.fillRect(obj.x + 20, obj.y + 5, 25, 10); // Seat
        ctx.fillStyle = "#34495e"; ctx.fillRect(obj.x + obj.width - 20, obj.y + 18, 25, 4); // Front Vanes
    } else if (obj.type === 'brick') {
        // Giant 2x4 Lego Brick
        ctx.fillStyle = obj.color || "#e74c3c";
        ctx.beginPath(); ctx.roundRect(obj.x, obj.y, obj.width, obj.height, 6); ctx.fill();
        
        // Brick Top Studs
        for (let s = 0; s < 4; s++) {
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.fillRect(obj.x + 8 + (s * 22), obj.y - 5, 14, 5);
        }
    } else {
        // Kyber Container
        ctx.fillStyle = "#1e272e"; ctx.beginPath(); ctx.roundRect(obj.x, obj.y, obj.width, obj.height, 8); ctx.fill();
        ctx.fillStyle = "#0984e3"; ctx.fillRect(obj.x + 10, obj.y + 15, obj.width - 20, 15);
    }

    ctx.restore();
}

// Render Droid Types
function drawDroid(ctx, d) {
    let drawY = d.y - d.bounceY;

    if (d.isFloating) {
        ctx.shadowBlur = 20; ctx.shadowColor = "#e0aaff";
        ctx.strokeStyle = "#e0aaff"; ctx.lineWidth = 3;
        ctx.strokeRect(d.x - 4, drawY - 4, d.width + 8, d.height + 8);
        ctx.shadowBlur = 0;
    }

    if (d.type === 'r2d2') {
        ctx.fillStyle = "#ecf0f1"; ctx.beginPath(); ctx.roundRect(d.x, drawY, d.width, d.height, [18,18,4,4]); ctx.fill();
        ctx.fillStyle = "#2980b9"; ctx.fillRect(d.x + 8, drawY + 12, 24, 8);
        ctx.fillStyle = "#e74c3c"; ctx.beginPath(); ctx.arc(d.x + 20, drawY + 16, 3, 0, Math.PI*2); ctx.fill();
    } else if (d.type === 'gonk') {
        ctx.fillStyle = "#7f8c8d"; ctx.beginPath(); ctx.roundRect(d.x, drawY, d.width, d.height, 4); ctx.fill();
        ctx.fillStyle = "#2c3e50"; ctx.fillRect(d.x + 5, drawY + 20, d.width - 10, 4);
    } else if (d.type === 'bb8') {
        ctx.fillStyle = "#ecf0f1"; ctx.beginPath(); ctx.arc(d.x + 20, drawY + 28, 16, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "#e67e22"; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = "#ecf0f1"; ctx.beginPath(); ctx.arc(d.x + 20, drawY + 10, 10, Math.PI, 0); ctx.fill();
        ctx.fillStyle = "#2c3e50"; ctx.beginPath(); ctx.arc(d.x + 20, drawY + 8, 3, 0, Math.PI*2); ctx.fill();
    } else if (d.type === 'mouse') {
        ctx.fillStyle = "#1e272e"; ctx.beginPath(); ctx.roundRect(d.x, drawY + 20, d.width, d.height - 20, [8,8,2,2]); ctx.fill();
        ctx.fillStyle = "#7f8c8d"; ctx.fillRect(d.x + 5, drawY + 38, 8, 6); ctx.fillRect(d.x + 27, drawY + 38, 8, 6);
    }

    if (d.textTimer > 0 || d.isFloating) {
        ctx.fillStyle = "#fff"; ctx.font = "bold 14px 'Comic Sans MS'";
        ctx.fillText(d.isFloating ? "Woah!! 🌀" : d.label, d.x - 10, drawY - 10);
    }
}
