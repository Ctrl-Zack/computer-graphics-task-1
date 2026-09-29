import { IDENTITY, transform } from '../../matrix3.js';
import { drawRectangle, drawEllipse, drawLine } from '../primitives.js';

// Generating data for corals objects.
export function createCoralData() {
    return [
        { x: -0.57, y: -0.62, scaleX: 0.19, scaleY: 0.25, rotation: -0.12, color: "#a76a79" },
        { x: -0.015, y: -0.80, scaleX: 0.25, scaleY: 0.28, rotation: 0.18, color: "#af7586" }
    ];
}

export function drawSmallCoral(renderer, coral, time = 0) {
    // Swinging left and right using a sine wave.
    const alternatingRotation = Math.sin(time * 1.5 + coral.x * 10) * 0.15;
    const root = transform(IDENTITY, coral.x, coral.y, coral.scaleX, coral.scaleY, coral.rotation + alternatingRotation);
    drawLine(renderer, root, [0,0], [0,0.82], 0.24, coral.color);
    drawEllipse(renderer, root, 0,0.82,0.24,0.23,coral.color);
    // Drawing coral branches.
    for (const side of [-1,1]) {
        const branch = transform(root, 0,0.30,1,1, side * 0.65);
        drawLine(renderer, branch,[0,0],[0,0.35],0.19,coral.color);
        drawEllipse(renderer, branch,0,0.35,0.19,0.20,coral.color);
    }
    for (const y of [0.2,0.49,0.72]) drawRectangle(renderer, transform(root,0,y,0.24,0.045), "#dab1b4", 0.65);
}