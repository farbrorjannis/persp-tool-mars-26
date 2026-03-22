const canvas = document.getElementById('perspectiveCanvas');
const ctx = canvas.getContext('2d');

const sizeSlider = document.getElementById('sizeSlider');
const heightSlider = document.getElementById('heightSlider');
const alphaSlider = document.getElementById('alphaSlider');
const addBtn = document.getElementById('addHouseBtn');
const selectionText = document.getElementById('selectionText');

let width, height;
let activeObject = null;
let selectedHouse = null; // Den stuga som just nu styrs av sliders

const app = {
    vpLeft: { x: 100, y: 350, isVP: true },
    vpRight: { x: 1100, y: 350, isVP: true },
    houses: []
};

// Skapa en start-stuga
function createHouse(x, y) {
    return {
        x: x || width / 2,
        y: y || height / 2 + 100,
        wOff: -1, // Vänster sidas djup-faktor
        dOff: 1.2, // Höger sidas djup-faktor
        size: 70,
        h: 60
    };
}

function init() {
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousedown', startDragging);
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', stopDragging);
    
    addBtn.onclick = () => {
        const newHouse = createHouse();
        app.houses.push(newHouse);
        selectHouse(newHouse);
        draw();
    };

    sizeSlider.oninput = () => { if(selectedHouse) selectedHouse.size = parseInt(sizeSlider.value); draw(); };
    heightSlider.oninput = () => { if(selectedHouse) selectedHouse.h = parseInt(heightSlider.value); draw(); };
    alphaSlider.oninput = draw;

    // Lägg till två startstugor
    setTimeout(() => {
        app.houses.push(createHouse(width * 0.3, height * 0.6));
        app.houses.push(createHouse(width * 0.7, height * 0.6));
        draw();
    }, 100);

    resize();
}

function selectHouse(house) {
    selectedHouse = house;
    sizeSlider.value = house.size;
    heightSlider.value = house.h;
    selectionText.innerText = "Editing Selected Cottage";
    document.querySelector('.settings').classList.add('active');
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    app.vpRight.x = width - 100;
    draw();
}

function getVPPoint(start, vp, targetX) {
    const slope = (vp.y - start.y) / (vp.x - start.x);
    return { x: targetX, y: start.y + slope * (targetX - start.x) };
}

function drawHouse(house) {
    const isSelected = (house === selectedHouse);
    ctx.globalAlpha = alphaSlider.value / 100;
    
    const bottomMid = { x: house.x, y: house.y };
    const topMid = { x: house.x, y: house.y - house.h };

    const bL = getVPPoint(bottomMid, app.vpLeft, house.x + (house.wOff * house.size));
    const tL = getVPPoint(topMid, app.vpLeft, house.x + (house.wOff * house.size));
    const bR = getVPPoint(bottomMid, app.vpRight, house.x + (house.dOff * house.size));
    const tR = getVPPoint(topMid, app.vpRight, house.x + (house.dOff * house.size));

    ctx.lineWidth = isSelected ? 3 : 1;

    // Left Wall
    ctx.beginPath();
    ctx.moveTo(bottomMid.x, bottomMid.y); ctx.lineTo(bL.x, bL.y); ctx.lineTo(tL.x, tL.y); ctx.lineTo(topMid.x, topMid.y);
    ctx.strokeStyle = "#ff4757"; ctx.stroke();

    // Right Wall
    ctx.beginPath();
    ctx.moveTo(bottomMid.x, bottomMid.y); ctx.lineTo(bR.x, bR.y); ctx.lineTo(tR.x, tR.y); ctx.lineTo(topMid.x, topMid.y);
    ctx.strokeStyle = "#2ed573"; ctx.stroke();

    // Roof
    ctx.beginPath();
    ctx.moveTo(tL.x, tL.y); 
    ctx.lineTo(house.x + (house.wOff * house.size * 0.5), tL.y - (house.h * 0.5)); 
    ctx.lineTo(topMid.x, topMid.y);
    ctx.strokeStyle = "#333"; ctx.stroke();

    // Anchor Point
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = isSelected ? "#2f3542" : "#2ed573";
    ctx.beginPath(); ctx.arc(house.x, house.y, isSelected ? 12 : 8, 0, Math.PI*2); ctx.fill();
}

function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#ccc";
    ctx.beginPath(); ctx.moveTo(0, app.vpLeft.y); ctx.lineTo(width, app.vpRight.y); ctx.stroke();

    app.houses.forEach(drawHouse);

    ctx.fillStyle = "#ff4757";
    [app.vpLeft, app.vpRight].forEach(vp => {
        ctx.beginPath(); ctx.arc(vp.x, vp.y, 10, 0, Math.PI*2); ctx.fill();
    });
}

function startDragging(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    activeObject = null;
    [app.vpLeft, app.vpRight].forEach(vp => {
        if (Math.hypot(vp.x - mx, vp.y - my) < 20) activeObject = vp;
    });

    app.houses.forEach(house => {
        if (Math.hypot(house.x - mx, house.y - my) < 20) {
            activeObject = house;
            selectHouse(house);
        }
    });
    draw();
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
