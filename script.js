// ... (behåll canvas-variabler och sliders från förra versionen)

let activeHouse = null; // Håller koll på vilken stuga som redigeras just nu

const app = {
    vpLeft: { x: 100, y: 350, isVP: true },
    vpRight: { x: 1100, y: 350, isVP: true },
    // Skapar 6 stugor med individuella värden
    houses: [
        { x: 200, y: 500, wOff: -1, dOff: 1.2, size: 70, h: 60 },
        { x: 400, y: 550, wOff: -0.8, dOff: 1, size: 60, h: 50 },
        { x: 600, y: 450, wOff: -0.6, dOff: 0.8, size: 50, h: 40 },
        { x: 800, y: 600, wOff: -1.2, dOff: 0.9, size: 80, h: 70 },
        { x: 300, y: 380, wOff: -0.5, dOff: 0.7, size: 40, h: 35 },
        { x: 900, y: 420, wOff: -0.9, dOff: 1.1, size: 55, h: 45 }
    ]
};

// Uppdatera värden på den valda stugan när man drar i sliders
sizeSlider.oninput = () => { if(activeHouse) activeHouse.size = parseInt(sizeSlider.value); draw(); };
heightSlider.oninput = () => { if(activeHouse) activeHouse.h = parseInt(heightSlider.value); draw(); };
alphaSlider.oninput = draw;

function drawHouse(house) {
    const isSelected = (house === activeHouse);
    const opacity = alphaSlider.value / 100;
    
    const bottomMid = { x: house.x, y: house.y };
    const topMid = { x: house.x, y: house.y - house.h };

    const bL = getVPPoint(bottomMid, app.vpLeft, house.x + (house.wOff * house.size));
    const tL = getVPPoint(topMid, app.vpLeft, house.x + (house.wOff * house.size));
    const bR = getVPPoint(bottomMid, app.vpRight, house.x + (house.dOff * house.size));
    const tR = getVPPoint(topMid, app.vpRight, house.x + (house.dOff * house.size));

    ctx.globalAlpha = opacity;
    // Markera vald stuga med tjockare linjer
    ctx.lineWidth = isSelected ? 3 : 1;

    // Väggar
    ctx.beginPath();
    ctx.moveTo(bottomMid.x, bottomMid.y); ctx.lineTo(bL.x, bL.y); ctx.lineTo(tL.x, tL.y); ctx.lineTo(topMid.x, topMid.y);
    ctx.strokeStyle = "#ff4757"; ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bottomMid.x, bottomMid.y); ctx.lineTo(bR.x, bR.y); ctx.lineTo(tR.x, tR.y); ctx.lineTo(topMid.x, topMid.y);
    ctx.strokeStyle = "#2ed573"; ctx.stroke();

    // Ankare (Gör det större om valt)
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = isSelected ? "#2f3542" : "#2ed573";
    ctx.beginPath(); ctx.arc(house.x, house.y, isSelected ? 12 : 8, 0, Math.PI*2); ctx.fill();
}

function startDragging(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    activeObject = null;
    
    // Kolla om vi klickar på en VP
    [app.vpLeft, app.vpRight].forEach(vp => {
        if (Math.hypot(vp.x - mx, vp.y - my) < 20) activeObject = vp;
    });

    // Kolla om vi klickar på en stuga
    app.houses.forEach(house => {
        if (Math.hypot(house.x - mx, house.y - my) < 20) {
            activeObject = house;
            activeHouse = house; // Gör denna till den "aktiva" stugan för sliders
            // Uppdatera sliders så de matchar den valda stugan
            sizeSlider.value = house.size;
            heightSlider.value = house.h;
        }
    });
    draw();
}
// ... (behåll resten av funktionerna som drag, resize etc)
