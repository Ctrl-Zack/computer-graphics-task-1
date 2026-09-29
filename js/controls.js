import { radians } from '../matrix3.js';

// Kecepatan per detik; terpisah dari speed animasi otomatis.
export const controls = {
    moveSpeed: 0.28, rotationSpeed: radians(75), scaleSpeed: 0.10,
    minScale: 0.06, maxScale: 0.35, minPosition: -0.85, maxPosition: 0.85
};

export function clearKeys(keys) {
    for (const key of Object.keys(keys)) delete keys[key];
}

export function resetFishTransform(fish, initialFish) {
    for (const field of ['x', 'y', 'scaleX', 'scaleY', 'rotation', 'direction']) {
        fish[field] = initialFish[field];
    }
}

export function updateControls(fish, keys, deltaTime) {
    if (deltaTime <= 0) return;
    let dx = Number(!!keys.arrowright) - Number(!!keys.arrowleft);
    let dy = Number(!!keys.arrowup) - Number(!!keys.arrowdown);
    const rotationDirection = Number(!!keys.q) - Number(!!keys.e);
    const scaleDirection = Number(!!keys.x) - Number(!!keys.z);
    const length = Math.hypot(dx, dy);
    if (length > 0) {
        // Normalisasi menjaga kecepatan diagonal sama dengan satu arah.
        dx /= length;
        dy /= length;
        fish.x += dx * controls.moveSpeed * deltaTime;
        fish.y += dy * controls.moveSpeed * deltaTime;
        fish.x = Math.max(controls.minPosition, Math.min(controls.maxPosition, fish.x));
        fish.y = Math.max(controls.minPosition, Math.min(controls.maxPosition, fish.y));
    }
    fish.rotation += rotationDirection * controls.rotationSpeed * deltaTime;
    if (scaleDirection) {
        const nextScale = Math.max(controls.minScale, Math.min(controls.maxScale,
            fish.scaleX + scaleDirection * controls.scaleSpeed * deltaTime));
        fish.scaleY *= nextScale / fish.scaleX;
        fish.scaleX = nextScale;
    }
}

export function setupControls(canvas, keys, actions) {
    const supported = ['arrowleft', 'arrowright', 'arrowup', 'arrowdown',
        'q', 'e', 'z', 'x', ' ', 'r', 'home', 'p', '[', ']'];
    canvas.addEventListener('keydown', event => {
        if (!actions.isAvailable()) return;
        if (event.ctrlKey || event.metaKey || event.altKey) { clearKeys(keys); return; }
        const key = event.key.toLowerCase();
        if (!supported.includes(key)) return;
        event.preventDefault();
        if (event.repeat || keys[key]) return;
        keys[key] = true; // Gerak kontinu dilakukan updateControls(), bukan keydown.
        if (key === ' ') actions.pause();
        if (key === 'r') event.shiftKey ? actions.resetScene() : actions.resetFish();
        if (key === 'home') actions.referencePose();
        if (key === 'p') actions.togglePivots();
        if (key === '[') actions.changeSpeed(-0.25);
        if (key === ']') actions.changeSpeed(0.25);
    });
    window.addEventListener('keyup', event => { delete keys[event.key.toLowerCase()]; });
    const release = () => { clearKeys(keys); actions.resetClock(); };
    canvas.addEventListener('blur', release);
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', release);
    canvas.addEventListener('pointerdown', () => canvas.focus({ preventScroll: true }));
}