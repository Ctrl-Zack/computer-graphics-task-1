import { IDENTITY, transform } from '../../matrix3.js';
import { drawPolygon } from '../primitives.js';

// Generating data for seashell objects.
export function createShellData() {
    return [
        { x: -0.77, y: -0.47, scale: 0.078, rotation: 0.12 },
        { x: -0.65, y: -0.49, scale: 0.066, rotation: -0.45 },
        { x: -0.21, y: -0.745, scale: 0.12, rotation: 0.08 },
        { x: 0.17, y: -0.885, scale: 0.10, rotation: 0.26 },
        { x: 0.35, y: -0.845, scale: 0.125, rotation: -0.33 },
        { x: 0.74, y: -0.81, scale: 0.084, rotation: 0.18 },
        { x: 0.90, y: -0.755, scale: 0.096, rotation: -0.22 }
    ];
}

export function drawShell(renderer, shell, time = 0, color = "#e3c1c9") {
    const { meshes } = renderer;
    const root = transform(IDENTITY,shell.x,shell.y,shell.scale,shell.scale,shell.rotation);
    
    // Animate opening and closing using a sine wave.
    // Sine wave offset by shell's x coordinate so they don't all open synchronously.
    const openAmount = (Math.sin(time * 2 + shell.x * 10) + 1); // Range 0 to 1
    const baseAngle1 = 0;
    const baseAngle2 = -0.55;
    // When openAmount is 1, they open wider. When 0, they close tighter.
    const animAngle1 = baseAngle1 + openAmount * 0.3;
    const animAngle2 = baseAngle2 - openAmount * 0.3;

    // Drawing the two parts of a seashell.
    for (const angle of [animAngle1, animAngle2]) {
        const leaf = transform(root,0,0,1.10,1,angle);
        drawPolygon(renderer, meshes.leaf,leaf,color);
        drawPolygon(renderer, meshes.leaf,transform(leaf,0,0.03,0.73,0.86),"#895767");
        drawPolygon(renderer, meshes.leaf,transform(leaf,0,0.06,0.45,0.61),"#d4b3bd");
        drawPolygon(renderer, meshes.leaf,transform(leaf,0,0.07,0.22,0.46),"#845263");
    }
}