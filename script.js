const canvas = document.getElementById('cvs'), ctx = canvas.getContext('2d');
const sizeSld = document.getElementById('sizeSld'), heightSld = document.getElementById('heightSld');
const rotSld = document.getElementById('rotSld'), sunSld = document.getElementById('sunSld');
const addBtn = document.getElementById('addBtn'), deleteBtn = document.getElementById('deleteBtn');
const downloadBtn = document.getElementById('downloadBtn'), statusText = document.getElementById('status');

let width, height, activeObj = null, selectedHouse = null;
const state = { vpL: { x: 150, y: 350, isVP: true }, vpR: { x: 1000, y: 350, isVP: true }, houses: [] };

function init() {
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', () => activeObj = null);
    
    addBtn.onclick = () => {
        const h = { x: width/2, y: height/2 + 50, size: 80, h: 60, rot: 45 };
        state.houses.push(h); select(h); draw();
    };

    deleteBtn.onclick = () => { 
        if(selectedHouse) { 
            state.houses = state.houses.filter(h => h !== selectedHouse); 
            select(null); draw(); 
        } 
    };
    
    downloadBtn.onclick = () => { 
        draw(true); 
        const link = document.createElement('a'); 
        link.download = 'watercolor-layout.png'; 
        link.href = canvas.toDataURL(); 
        link.click(); 
        draw(false); 
    };

    [sizeSld, heightSld, rotSld, sunSld].forEach(s => s.oninput = () => {
        if(selectedHouse) {
            selectedHouse.size = parseInt(sizeSld.value);
            selectedHouse.h = parseInt(heightSld.value);
            selectedHouse.rot = parseInt(rotSld.value);
        }
        draw();
    });

    resize();
    state.houses.push({ x: width * 0.4, y: height * 0.7, size: 100, h: 70, rot: 35 });
    draw();
}

function select(h) {
    selectedHouse = h;
    if(h) {
        sizeSld.value = h.size; heightSld.value = h.h; rotSld.value = h.rot;
        deleteBtn.disabled = false; deleteBtn.classList.add('active');
        statusText.innerText = "Cottage selected";
    } else {
        deleteBtn.disabled = true; deleteBtn.classList.remove('active');
        statusText.innerText = "Select a green anchor";
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    state.vpR.x = width - 150;
    sunSld.max = width;
    draw();
}

// Perspective projection math
function getP(p, vp, tx) { 
    return { x: tx, y: p.y + (vp.y - p.y) / (vp.x - p.x) * (tx - p.x) }; 
}

function draw(clean = false) {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#ddd";
    ctx.beginPath(); ctx.moveTo(0, state.vpL.y); ctx.lineTo(width, state.vpR.y); ctx.stroke();

    const sunX = parseInt(sunSld.value);
    if(!clean) { 
        ctx.fillStyle = "#FFD700"; ctx.beginPath(); ctx.arc(sunX, state.vpL.y - 15, 12, 0, 7); ctx.fill(); 
    }

    state.houses.forEach(h => {
        const isSel = (h === selectedHouse && !clean);
        const bMid = { x: h.x, y: h.y }, tMid = { x: h.x, y: h.y - h.h };
        
        // --- 360 DEGREE LOGIC ---
        const angle = (h.rot * Math.PI) / 180;
        // Beräkna offset för hörn i 360 grader
        const xL = h.x - h.size * Math.cos(angle);
        const xR = h.x + h.size * Math.sin(angle);

        const bL = getP(bMid, state.vpL, xL), tL = getP(tMid, state.vpL, xL);
        const bR = getP(bMid, state.vpR, xR), tR = getP(tMid, state.vpR, xR);

        // Skuggning baserat på solens position relativt huset
        const shadeL = Math.max(0.1, Math.min(0.8, (sunX - xL) / 400 + 0.2));
        const shadeR = Math.max(0.1, Math.min(0.8, (xR - sunX) / 400 + 0.2));

        ctx.lineWidth = isSel ? 3 : 1.5;
        
        // Vänster vägg
        ctx.fillStyle = `rgba(150, 150, 150, ${shadeL})`;
        ctx.beginPath(); ctx.moveTo(bMid.x, bMid.y); ctx.lineTo(bL.x, bL.y); ctx.lineTo(tL.x, tL.y); ctx.lineTo(tMid.x, tMid.y); ctx.fill();
        ctx.strokeStyle = "#ff4757"; ctx.stroke();

        // Höger vägg
        ctx.fillStyle = `rgba(150, 150, 150, ${shadeR})`;
        ctx.beginPath(); ctx.moveTo(bMid.x, bMid.y); ctx.lineTo(bR.x, bR.y); ctx.lineTo(tR.x, tR.y); ctx.lineTo(tMid.x, tMid.y); ctx.fill();
        ctx.strokeStyle = "#2ed573"; ctx.stroke();

        // Taknock som följer rotationen
        ctx.strokeStyle = "#333";
        ctx.beginPath();
        ctx.moveTo(tL.x, tL.y);
        ctx.lineTo(h.x - (h.size * 0.5) * Math.cos(angle + 0.5), tL.y - h.h * 0.4);
        ctx.lineTo(tMid.x, tMid.y);
        ctx.stroke();

        if(!clean) {
            ctx.fillStyle = isSel ? "#2f3542" : "#2ed573";
            ctx.beginPath(); ctx.arc(h.x, h.y, isSel ? 10 : 7, 0, 7); ctx.fill();
        }
    });

    if(!clean) {
        ctx.fillStyle = "#ff4757";
        [state.vpL, state.vpR].forEach(v => { ctx.beginPath(); ctx.arc(v.x, v.y, 10, 0, 7); ctx.fill(); });
    }
}

function start(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top; 
    activeObj = null;
    [state.vpL, state.vpR].forEach(v => { if(Math.hypot(v.x-mx, v.y-my) < 25) activeObj = v; });
    state.houses.forEach(h => { if(Math.hypot(h.x-mx, h.y-my) < 25) { activeObj = h; select(h); } });
    if(!activeObj) select(null);
    draw();
}

function move(e) {
    if(!activeObj) return;
    const rect = canvas.getBoundingClientRect();
    activeObj.x = e.clientX - rect.left; activeObj.y = e.clientY - rect.top;
    if(activeObj.isVP) state.vpL.y = state.vpR.y = activeObj.y;
    draw();
}

init();
