import { IDENTITY, transform } from '../../matrix3.js';
import { drawPolygon, drawEllipse } from '../primitives.js';

export function createBubbleData() {
    return { items: [
        { x:-0.56, y:-0.32, radius:0.011, speed:0.055, phase:0, layer:"front" },
        { x:-0.54, y:-0.27, radius:0.007, speed:0.060, phase:1, layer:"front" },
        { x:-0.56, y:-0.21, radius:0.012, speed:0.052, phase:2, layer:"front" },
        { x:-0.55, y:-0.165, radius:0.006, speed:0.048, phase:3, layer:"front" },
        { x:0.34, y:0.020, radius:0.008, speed:0.061, phase:0, layer:"back" },
        { x:0.335, y:0.063, radius:0.006, speed:0.055, phase:1, layer:"back" },
        { x:0.355, y:0.11, radius:0.007, speed:0.060, phase:2, layer:"back" },
        { x:0.54, y:0.21, radius:0.007, speed:0.054, phase:0, layer:"back" },
        { x:0.525, y:0.25, radius:0.007, speed:0.050, phase:2, layer:"back" },
        { x:0.22, y:-0.77, radius:0.013, speed:0.055, phase:0, layer:"front" },
        { x:0.19, y:-0.70, radius:0.011, speed:0.050, phase:1, layer:"front" },
        { x:0.22, y:-0.62, radius:0.013, speed:0.060, phase:2, layer:"front" },
        { x:0.185, y:-0.47, radius:0.008, speed:0.052, phase:3, layer:"front" },
        { x:0.90, y:-0.64, radius:0.018, speed:0.052, phase:0, layer:"front" },
        { x:0.88, y:-0.565, radius:0.014, speed:0.060, phase:1, layer:"front" },
        { x:0.92, y:-0.515, radius:0.010, speed:0.049, phase:2, layer:"front" },
        { x:0.88, y:-0.465, radius:0.011, speed:0.055, phase:3, layer:"front" }
    ], speed: 1, sway: 0.009 };
}

export function drawBubbles(renderer, bubbles, time, layer, aspect) {
    const { meshes } = renderer;
    for (const bubble of bubbles.items) {
        if (bubble.layer !== layer) continue;
        
        // Calculate y procedurally based on time, speed, and initial position
        const currentY = bubble.y + time * bubble.speed * bubbles.speed;
        const proceduralY = ((currentY + 1.08) % 2.16) - 1.08;

        const x = bubble.x + (Math.sin(time * 0.8 + bubble.phase) - Math.sin(bubble.phase)) * bubbles.sway;
        const diameter = bubble.radius * 2;
        const opacity = Math.min(1, (1.08 - Math.abs(proceduralY)) / 0.12) * 0.72;
        // Koreksi aspect: diameter X dalam pixel sama dengan diameter Y.
        const matrix = transform(IDENTITY, x, proceduralY, diameter, diameter * aspect);
        drawPolygon(renderer, meshes.ring,matrix,"#e4dde6",Math.max(0,opacity));
    }
    if (layer === "back") {
        // Bintik kecil tetap: detail air pada referensi, bukan particle engine.
        const specks = [[-0.33,0.60],[-0.11,0.71],[0.12,0.49],[0.59,0.63],[-0.42,0.24],
            [-0.31,0.11],[-0.065,-0.08],[0.71,-0.11],[0.37,-0.035],[0.66,0.96],[0.80,0.91],[0.46,0.98]];
        for (const [x,y] of specks) drawEllipse(renderer, IDENTITY,x,y,0.004,0.011,"#cad0dc",-0.2,0.65);
    }
}