const canvas = document.getElementById('perspectiveCanvas');
const ctx = canvas.getContext('2d');

const sizeSlider = document.getElementById('sizeSlider');
const heightSlider = document.getElementById('heightSlider');
const alphaSlider = document.getElementById('alphaSlider');

let width, height;
let activeObject = null;

const app = {
    vpLeft: { x: 100, y: 300, isVP: true },
    vpRight: { x: 900, y: 300, isVP: true },
    houses: [
        { x: 300, y: 500, wOff: -1, dOff: 1.2 },
        { x: 600, y: 450, wOff: -0.8, dOff: 1 },
        { x: 450, y: 350, wOff: -0.6, dOff: 0.8 }
    ]
};

function init() {
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousedown', startDragging);
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', stopDragging);
    
    [sizeSlider, heightSlider, alphaSlider].forEach(s => s.oninput = draw);
    resize();
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    app.vpRight.x = width - 100; // Reset VP Right to edge
    draw();
}

function getVPPoint(start, vp, targetX) {
    const slope = (vp.y - start.y) / (vp.x - start.x);
    return { x: targetX, y: start.y + slope * (targetX - start.x) };
}

function drawHouse(house) {
    const size = parseInt(sizeSlider.value);
    const h = parseInt(heightSlider.value);
    ctx.globalAlpha = alphaSlider.value / 100;

    const bottomMid = { x: house.x, y: house.y };
    const topMid = { x: house.x, y: house.y - h };

    const bL = getVPPoint(bottomMid, app.vpLeft, house.x + (house.wOff * size));
    const tL = getVPPoint(topMid, app.vpLeft, house.x + (house.wOff * size));
    const bR = getVPPoint(bottomMid, app.vpRight, house.x + (house.dOff * size));
    const tR = getVPPoint(topMid, app.vpRight, house.x + (house.dOff * size));

    // Left wall (Red guide)
    ctx.beginPath();
    ctx.moveTo(bottomMid.x, bottomMid.y);
    ctx.lineTo(bL.x, bL.y); ctx.lineTo(tL.x, tL.y); ctx.lineTo(topMid.x, topMid.y);
    ctx.strokeStyle = "#ff4757"; ctx.stroke();

    // Right wall (Green guide)
    ctx.beginPath();
    ctx.moveTo(bottomMid.x, bottomMid.y);
    ctx.lineTo(bR.x, bR.y); ctx.lineTo(tR.x, tR.y); ctx.lineTo(topMid.x, topMid.y);
    ctx.strokeStyle = "#2ed573"; ctx.stroke();

    // Roof
    ctx.beginPath();
    ctx.moveTo(tL.x, tL.y); ctx.lineTo(house.x + (house.wOff * size * 0.5), tL.y - 30); ctx.lineTo(topMid.x, topMid.y);
    ctx.strokeStyle = "#333"; ctx.stroke();

    // Anchor
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "#2ed573";
    ctx.beginPath(); ctx.arc(house.x, house.y, 8, 0, Math.PI*2); ctx.fill();
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    // Horizon line
    ctx.strokeStyle = "#ccc";
    ctx.beginPath(); ctx.moveTo(0, app.vpLeft.y); ctx.lineTo(width, app.vpRight.y); ctx.stroke();

    app.houses.forEach(drawHouse);

    // VPs
    ctx.fillStyle = "#ff4757";
    [app.vpLeft, app.vpRight].forEach(vp => {
        ctx.beginPath(); ctx.arc(vp.x, vp.y, 10, 0, Math.PI*2); ctx.fill();
    });
}

function startDragging(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const targets = [app.vpLeft, app.vpRight, ...app.houses];
    targets.forEach(t => {
        if (Math.hypot(t.x - mx, t.y - my) < 20) activeObject = t;
    });
}

function drag(e) {
    if (!activeObject) return;
    const rect = canvas.getBoundingClientRect();
    activeObject.x = e.clientX - rect.left;
    activeObject.y = e.clientY - rect.top;

    if (activeObject.isVP) app.vpLeft.y = app.vpRight.y = activeObject.y;
    draw();
}

function stopDragging() { activeObject = null; }

init();
