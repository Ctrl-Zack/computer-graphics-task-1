import { IDENTITY, transform } from '../../matrix3.js';
import { drawPolygon } from '../primitives.js';

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

export function drawShell(renderer, shell, color = "#e3c1c9") {
    const { meshes } = renderer;
    const root = transform(IDENTITY,shell.x,shell.y,shell.scale,shell.scale,shell.rotation);
    for (const angle of [0.52,-0.55]) {
        const leaf = transform(root,0,0,1.10,1,angle);
        drawPolygon(renderer, meshes.leaf,leaf,color);
        drawPolygon(renderer, meshes.leaf,transform(leaf,0,0.03,0.73,0.86),"#895767");
        drawPolygon(renderer, meshes.leaf,transform(leaf,0,0.06,0.45,0.61),"#d4b3bd");
        drawPolygon(renderer, meshes.leaf,transform(leaf,0,0.07,0.22,0.46),"#845263");
    }
}