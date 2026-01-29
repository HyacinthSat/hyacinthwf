
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const compassCanvas = document.getElementById('compass');
const compassCtx = compassCanvas.getContext('2d');

const overlayCanvas = document.getElementById('overlay');
const overlayCtx = overlayCanvas.getContext('2d');

// Desired CSS size (px)
const CSS_SIZE = 400;
let dpr = window.devicePixelRatio || 1;
let cssW = CSS_SIZE;
let cssH = CSS_SIZE;

let currentPitch = 0;
let currentRoll = 0;
let currentYaw = 0;

// Base visual config (interpreted for a 700px design). We'll scale to CSS_SIZE.
let config = {
    lineWidth: 3,
    rollScaleWidth: 100,
    tailSize: 15,
    strokeStyle: "#17ff06",
    pitchPadding: 140,
    pitchLine: 20,
    pitchTextPadding: 10,
    pitchMaxRange: 180,
    pitchStep: 20,
    stringHeightCenterCorrection: 3,
    baseCanvas: 700
};

let scaled = {};
let flyBySelf = false;

function initSizes() {
    dpr = window.devicePixelRatio || 1;
    cssW = CSS_SIZE;
    cssH = CSS_SIZE;

    [canvas, compassCanvas, overlayCanvas].forEach(c => {
        c.style.width = cssW + 'px';
        c.style.height = cssH + 'px';
        c.width = Math.round(cssW * dpr);
        c.height = Math.round(cssH * dpr);
    });

    // compute scale relative to original 700 design
    const scale = cssW / config.baseCanvas;

    scaled.lineWidth = Math.max(1, config.lineWidth * scale);
    scaled.rollScaleWidth = config.rollScaleWidth * scale;
    scaled.tailSize = config.tailSize * scale;
    scaled.pitchPadding = config.pitchPadding * scale;
    scaled.pitchLine = config.pitchLine * scale;
    scaled.pitchTextPadding = config.pitchTextPadding * scale;
    scaled.stringHeightCenterCorrection = config.stringHeightCenterCorrection * scale;
    scaled.compassR = 250 * scale;
    scaled.tickLenShort = 10 * scale;
    scaled.tickLenLong = 20 * scale;

    // fonts (use CSS px sizes)
    ctx.font = Math.max(9, 10 * scale) + 'px sans-serif';
    ctx.fillStyle = config.strokeStyle;
    compassCtx.font = Math.max(12, 20 * scale) + 'px monospace';
    compassCtx.fillStyle = config.strokeStyle;
    compassCtx.strokeStyle = config.strokeStyle;
    compassCtx.textAlign = 'center';
    compassCtx.textBaseline = 'middle';

    overlayCtx.strokeStyle = config.strokeStyle;
    overlayCtx.lineWidth = Math.max(1, 2 * scale);
}

function drawAll(roll, pitch, yaw) {
    draw(roll, pitch);
    drawCompass(yaw);
}

function draw(roll, pitch) {
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(cssW / 2, cssH / 2);
    ctx.clearRect(-cssW / 2, -cssH / 2, cssW, cssH);
    drawPitch(pitch);
    drawRollLine(roll);
    ctx.restore();
}

function clearCtx() {
    ctx.rotate(Math.PI * (-currentRoll)/180);
    ctx.clearRect(-w/2, -h/2, w, h);
}

function drawPitch(pitch) {
    const currentCenter = Math.trunc(pitch/config.pitchStep)* config.pitchStep;
    const allStepsCount = config.pitchMaxRange / config.pitchStep;

    const values = []

    let calculatedSteps = -allStepsCount;
    let currentCount = currentCenter - config.pitchMaxRange - config.pitchStep;

    while(calculatedSteps < allStepsCount + 1) {
        if (currentCount === 180) {
            currentCount = currentCount - 360;
        } 
        currentCount = currentCount + config.pitchStep;
        
        values.push({
            coords: pitch - currentCenter - (calculatedSteps) * config.pitchStep,
            value: currentCount > -180 ? currentCount : currentCount + 360,
        });
        calculatedSteps++;
    }




    ctx.fillStyle = config.strokeStyle;
    ctx.strokeStyle = config.strokeStyle;
    ctx.lineWidth = config.lineWidth;
    ctx.beginPath();

    values.forEach(value => {
        // left side
        ctx.fillText(value.value, -config.pitchPadding - config.pitchTextPadding * 2, value.coords + config.stringHeightCenterCorrection);
        ctx.fill();
        if (value.value % 60 === 0) {
            ctx.moveTo(-config.pitchPadding - config.pitchTextPadding * 3, value.coords);
        } else {
            ctx.moveTo(-config.pitchPadding - config.pitchTextPadding * 3 - config.pitchLine*2/3, value.coords);
        }
        ctx.lineTo(-config.pitchPadding - config.pitchTextPadding * 3 - config.pitchLine , value.coords);
        ctx.stroke();


        // right side
        ctx.fillText(value.value, config.pitchPadding, value.coords + config.stringHeightCenterCorrection);
        ctx.fill();
        if (value.value % 60 === 0) {
            ctx.moveTo(config.pitchPadding + config.pitchTextPadding * 3, value.coords);
        } else {
            ctx.moveTo(config.pitchPadding + config.pitchTextPadding * 3 + config.pitchLine*2/3, value.coords);
        }
        ctx.lineTo(config.pitchPadding + config.pitchTextPadding * 3 + config.pitchLine , value.coords);
        ctx.stroke();
    })
}

function drawRollLine(roll) {
    ctx.rotate(Math.PI * roll/180);
    currentRoll = roll;
    ctx.strokeStyle = config.strokeStyle;
    ctx.lineWidth = config.lineWidth;
    ctx.beginPath();
    ctx.moveTo(-config.rollScaleWidth - config.tailSize, 0);
    ctx.lineTo(-config.tailSize, 0);
    ctx.lineTo(0, config.tailSize);
    ctx.lineTo(config.tailSize, 0);
    ctx.lineTo(config.rollScaleWidth + config.tailSize, 0);
    ctx.stroke();
    ctx.closePath();
}

function drawCompass(yaw) {
    compassCtx.save();
    compassCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    compassCtx.translate(cssW / 2, cssH / 2);
    compassCtx.clearRect(-cssW / 2, -cssH / 2, cssW, cssH);

    compassCtx.fillStyle = config.strokeStyle;
    compassCtx.fillText(String(yaw), 0, -cssH / 2 + 30);

    compassCtx.save();
    compassCtx.rotate((-yaw) * Math.PI / 180);

    const r = scaled.compassR;
    const tickLenShort = scaled.tickLenShort;
    const tickLenLong = scaled.tickLenLong;

    compassCtx.strokeStyle = config.strokeStyle;
    compassCtx.lineWidth = Math.max(1, scaled.lineWidth - 1);

    compassCtx.beginPath();
    compassCtx.arc(0, 0, r, 0, Math.PI * 2);
    compassCtx.stroke();

    for (let i = 0; i < 360; i += 15) {
        compassCtx.save();
        compassCtx.rotate((i - 90) * Math.PI / 180);
        compassCtx.beginPath();
        if (i % 90 === 0) {
            compassCtx.moveTo(r, 0);
            compassCtx.lineTo(r - tickLenLong, 0);
            compassCtx.stroke();
            compassCtx.translate(r - tickLenLong - 35 * (cssW / config.baseCanvas), 0);
            compassCtx.rotate(Math.PI / 2);
            let label = '';
            if (i === 0) label = 'N';
            else if (i === 90) label = 'E';
            else if (i === 180) label = 'S';
            else if (i === 270) label = 'W';
            compassCtx.fillText(label, 0, 0);
        } else {
            compassCtx.moveTo(r, 0);
            compassCtx.lineTo(r - tickLenShort, 0);
            compassCtx.stroke();
        }
        compassCtx.restore();
    }

    compassCtx.restore();
    currentYaw = yaw;
}

function handleKeyDown(event) {
    switch (event.code) {
        case 'ArrowLeft':
            draw(currentRoll - 1, currentPitch);
            break;
        case 'ArrowRight':
            draw(currentRoll + 1, currentPitch);
            break;
        case 'ArrowUp':
            currentPitch = getNewPitch(true);
            draw(currentRoll, currentPitch);
            break;
        case 'ArrowDown':
            currentPitch = getNewPitch(false);
            draw(currentRoll, currentPitch);
            break;
        case 'PageUp':
            let newYawUp = currentYaw + 1;
            if (newYawUp >= 360) newYawUp -= 360;
            drawCompass(newYawUp);
            break;
        case 'PageDown':
            let newYawDown = currentYaw - 1;
            if (newYawDown < 0) newYawDown += 360;
            drawCompass(newYawDown);
            break;
        case 'KeyA':
            flyBySelf = !flyBySelf;
            requestAnimationFrame(tick);
            break;
        default:
            break;
    }
}

function getNewPitch(increment) {
    if (currentPitch === 180 && increment) {
        return currentPitch - 359;
    } else if (currentPitch === -179 && !increment) {
        return currentPitch + 359;
    }

    return increment ? currentPitch + 1 : currentPitch - 1;
}

function tick() {
    if (flyBySelf) {
        requestAnimationFrame(tick);
    }

    currentPitch = getNewPitch(Math.random() > 0.5);
    
    draw((Math.random() > 0.5 && currentRoll < 40 || currentRoll < -40 ? currentRoll + 1 : currentRoll - 1), currentPitch);
}

document.addEventListener('keydown', handleKeyDown);

// Draw overlay reference lines
// initialize sizes and draw
initSizes();
drawAll(0, 0, 0);

function drawOverlay() {
    overlayCtx.save();
    overlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    overlayCtx.clearRect(0, 0, cssW, cssH);
    overlayCtx.translate(cssW / 2, cssH / 2);

    overlayCtx.strokeStyle = config.strokeStyle;
    overlayCtx.lineWidth = Math.max(1, 2 * (cssW / config.baseCanvas));

    const lineLength = 200 * (cssW / config.baseCanvas);
    const halfLen = lineLength / 2;

    overlayCtx.beginPath();
    overlayCtx.moveTo(-halfLen, 0);
    overlayCtx.lineTo(halfLen, 0);
    overlayCtx.moveTo(0, -halfLen);
    overlayCtx.lineTo(0, halfLen);
    overlayCtx.stroke();
    overlayCtx.restore();
}

drawOverlay();

window.addEventListener('resize', () => {
    initSizes();
    drawAll(currentRoll, currentPitch, currentYaw);
    drawOverlay();
});