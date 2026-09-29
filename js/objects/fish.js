import { IDENTITY, transform, radians } from '../../matrix3.js';
import { createPolygon, drawPolygon, drawTriangle, drawEllipse } from '../primitives.js';
// Parameter posisi/skala serta kecepatan otomatis dapat diubah untuk demo.
export function createFishData() {
    return [
        { x: 0.45, y: 0.18, scaleX: 0.17, scaleY: 0.17, rotation: 0, direction: 1,
          speed: 0.5, amplitude: 0.085, verticalSpeed: 0.85, verticalAmplitude: 0.015,
          tailSpeed: 4.2, tailAmplitude: 14, tailDirection: 1, phase: 0, color: "#eec563" },
        { x: 0.28, y: 0.005, scaleX: 0.125, scaleY: 0.125, rotation: 0.08, direction: 1,
          speed: 0.62, amplitude: 0.060, verticalSpeed: 1.0, verticalAmplitude: 0.012,
          tailSpeed: 4.8, tailAmplitude: 17, tailDirection: 1, phase: 0.8, color: "#efbb50" }
    ];
}

export function createFishMeshes(renderer) {
    const meshes = {};
    meshes.fishBody = createPolygon(renderer, [[-0.52,-0.02],[-0.38,0.17],[-0.25,0.33],[-0.08,0.37],
        [0.13,0.31],[0.31,0.18],[0.44,-0.04],[0.24,-0.19],[0.02,-0.24],[-0.23,-0.20],[-0.42,-0.12]]);
    meshes.fishFace = createPolygon(renderer, [[0.20,0.265],[0.31,0.18],[0.44,-0.04],[0.24,-0.19],[0.16,-0.21]]);
    meshes.fishGold = createPolygon(renderer, [[-0.25,0.33],[-0.08,0.37],[0.13,0.31],[0.31,0.18],
        [0.44,-0.04],[0.24,-0.19],[0.02,-0.24],[-0.12,-0.217]]);
    meshes.fishStripes = [
        createPolygon(renderer, [[-0.30,0.257],[-0.255,0.323],[-0.25,-0.193],[-0.31,-0.167]]),
        createPolygon(renderer, [[-0.09,0.367],[-0.04,0.359],[0.005,-0.238],[-0.06,-0.227]]),
        createPolygon(renderer, [[0.14,0.303],[0.195,0.263],[0.235,-0.192],[0.18,-0.205]])
    ];
    return meshes;
}

export function drawFish(renderer, fish, time, showPivots = false) {
    const pose = {
        x: fish.x + fish.direction * Math.sin(time * fish.speed) * fish.amplitude,
        y: fish.y + (Math.sin(time * fish.verticalSpeed + fish.phase) - Math.sin(fish.phase)) * fish.verticalAmplitude,
        tailAngle: Math.sin(time * fish.tailSpeed) * radians(fish.tailAmplitude) * fish.tailDirection
    };

    const { meshes } = renderer;
    const root = transform(IDENTITY, pose.x, pose.y, fish.scaleX * fish.direction, fish.scaleY, fish.rotation);
    // Pivot (0,0) triangle ekor berada di sambungan badan, bukan pusat ekor.
    const tail = transform(root, -0.49, -0.055, 1, 1, pose.tailAngle);
    drawTriangle(renderer, transform(tail,0,0,0.32,0.28),"#713c51");
    drawTriangle(renderer, transform(tail,-0.05,0,0.15,0.14),"#b66563");
    drawTriangle(renderer, transform(root,-0.17,0.28,0.18,0.14,-0.5),"#df9a56");
    drawTriangle(renderer, transform(root,-0.18,-0.14,0.12,0.13,1.25),"#bb7155");
    drawPolygon(renderer, meshes.fishBody,root,"#df9254");
    drawPolygon(renderer, meshes.fishGold,root,fish.color);
    drawPolygon(renderer, meshes.fishFace,root,"#f5db89");
    for (const stripe of meshes.fishStripes) drawPolygon(renderer, stripe,root,"#34424d");
    drawEllipse(renderer, root,0.305,-0.015,0.040,0.043,"#495149");
    drawEllipse(renderer, root,0.310,-0.009,0.010,0.011,"#fff1b7");
    if (showPivots) {
        drawEllipse(renderer, root,0,0,0.06,0.06,"#ffffff");
        drawEllipse(renderer, tail,0,0,0.065,0.065,"#ec92a5");
    }
}