import { IDENTITY, transform } from '../../matrix3.js';
import { createPolygon, drawPolygon, drawEllipse } from '../primitives.js';
// Satu hantu kiri. x/y = posisi dasar; amplitude = tinggi ayunan; speed = radian/detik.
// scale mengubah ukuran; phase menggeser timing. amplitude: 0 atau animated: false untuk diam.
export function createCreatureData() {
    return [
        { x: -0.365, y: -0.71, scale: 0.27, rotation: -0.16,
          amplitude: 0.025, speed: 0.70, phase: 0, animated: true, layer: "back" }
    ];
}

export function createCreatureMeshes(renderer) {
    const meshes = {};
    meshes.creatureBody = createPolygon(renderer, [[-0.50,-0.12],[-0.48,0.20],[-0.37,0.48],
        [-0.20,0.63],[0,0.69],[0.22,0.63],[0.40,0.46],[0.49,0.19],
        [0.50,-0.10],[0.32,-0.47],[0,-0.87],[-0.32,-0.47]]);
    return meshes;
}

export function drawSeaCreature(renderer, creature, time) {
    const offsetY = creature.animated
        ? Math.sin(time * creature.speed + creature.phase) * creature.amplitude
        : 0;
    const pose = { x: creature.x, y: creature.y + offsetY, rotation: creature.rotation };

    // Blur effect: draw multiple faint radial copies
    const passes = 6;
    for (let i = 0; i < passes; i++) {
        const angle = i * Math.PI * 2 / passes;
        const radius = 0.02; // Blur radius
        const blurPose = {
            x: pose.x + Math.cos(angle) * radius,
            y: pose.y + Math.sin(angle) * radius,
            rotation: pose.rotation
        };
        drawCreaturePass(renderer, blurPose, creature.scale, 0.1);
    }
    // Main ghostly body
    drawCreaturePass(renderer, pose, creature.scale, 0.6);
}

function drawCreaturePass(renderer, pose, scale, opacity) {
    const { meshes } = renderer;
    const root = transform(IDENTITY, pose.x, pose.y, scale, scale, pose.rotation);
    drawEllipse(renderer, root,-0.43,-0.18,0.28,0.14,"#d5dbe2",-0.45, opacity);
    drawEllipse(renderer, root,0.43,-0.18,0.28,0.14,"#d5dbe2",0.45, opacity);
    drawPolygon(renderer, meshes.creatureBody,root,"#bbcbd5", opacity);
    drawPolygon(renderer, meshes.creatureBody,transform(root,-0.025,0,0.89,0.95),"#e0d8df", opacity);
    drawPolygon(renderer, meshes.creatureBody,transform(root,-0.05,-0.015,0.77,0.89),"#f2e2e4", opacity);
    drawSurprisedFace(renderer, root, opacity);
}

function drawSurprisedFace(renderer, creatureMatrix, opacity) {
    const { meshes } = renderer;
    // Mata kecil langsung pada badan; posisi dan ukuran tetap dalam ruang lokal.
    const eyeColor = "#00060a";
    drawEllipse(renderer, creatureMatrix,-0.14,0.165,0.070,0.110,eyeColor,-0.10,opacity);
    drawEllipse(renderer, creatureMatrix,0.14,0.180,0.066,0.103,eyeColor,0.08,opacity);

    // Ring oval kecil: ekspresi "o" tanpa bidang gelap menyerupai lubang.
    const mouth = transform(creatureMatrix,0.005,-0.025,0.052,0.073,-0.06);
    drawPolygon(renderer, meshes.ring,mouth,"#17232e",opacity);
}