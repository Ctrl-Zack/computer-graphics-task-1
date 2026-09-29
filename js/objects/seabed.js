import { IDENTITY, transform } from '../../matrix3.js';
import { createPolygon, drawPolygon, drawEllipse } from '../primitives.js';
import { createMesh } from '../webgl.js';

export function createSeabedData() {
    // Batu dan dasar laut menggunakan ruang lokal kelompok yang sama, origin (0,0).
    return { x:0, y:0, scaleX:1, scaleY:1, rotation:0,
        color:'#0c142b', rock:'#080f23', rockFacet:'#111d37' };
}

function createSeabed(renderer) {
    const top = [[-1,-0.85],[-0.65,-0.82],[-0.36,-0.95],[-0.10,-0.83],
        [0.10,-0.87],[0.24,-0.81],[0.42,-0.79],[0.60,-0.815],[0.78,-0.76],[1,-0.70]];
    const vertices = [];
    // Setiap dua titik permukaan membentuk trapezoid hingga dasar y=-1.
    for (let i = 0; i < top.length - 1; i++) {
        const a = top[i], b = top[i+1];
        vertices.push(a[0],-1, ...b, ...a, a[0],-1, b[0],-1, ...b);
    }
    return createMesh(renderer, vertices);
}

export function createSeabedMeshes(renderer) {
    const meshes = {};
    meshes.seabed = createSeabed(renderer);
    meshes.leftRock = createPolygon(renderer, [[-1,-1],[-1,-0.73],[-0.89,-0.53],[-0.79,-0.435],
        [-0.64,-0.48],[-0.55,-0.60],[-0.35,-0.90],[-0.30,-1]]);
    meshes.middleRock = createPolygon(renderer, [[-0.39,-1],[-0.35,-0.90],[-0.24,-0.755],[-0.095,-0.67],[0.035,-0.83],[0.16,-1]]);
    meshes.rockFacet = createPolygon(renderer, [[-1,-0.73],[-0.89,-0.53],[-0.79,-0.435],[-0.80,-0.73],[-0.9,-1],[-1,-1]]);
    return meshes;
}

export function drawSeabed(renderer, seabed) {
    const root = transform(IDENTITY, seabed.x, seabed.y, seabed.scaleX, seabed.scaleY, seabed.rotation);
    drawPolygon(renderer, renderer.meshes.seabed, root, seabed.color);
}

export function drawRock(renderer, seabed) {
    const { meshes } = renderer;
    const root = transform(IDENTITY, seabed.x, seabed.y, seabed.scaleX, seabed.scaleY, seabed.rotation);
    drawPolygon(renderer, meshes.leftRock, root, seabed.rock);
    drawPolygon(renderer, meshes.rockFacet, root, seabed.rockFacet,0.60);
    drawPolygon(renderer, meshes.middleRock, root, seabed.rock);
}

export function drawStones(renderer) {
    const stones = [[-0.855,-0.632,0.048],[-0.70,-0.473,0.04],
        [-0.56,-0.574,0.035],[0.81,-0.75,0.038]];
    for (const [x,y,width] of stones) drawEllipse(renderer, IDENTITY,x,y,width,0.012,"#bec5d4",0.25);
}