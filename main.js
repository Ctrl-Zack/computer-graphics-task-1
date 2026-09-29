import { initWebGL } from './js/webgl.js';
import { createPrimitives } from './js/primitives.js';
import { setupControls, updateControls, clearKeys, resetFishTransform } from './js/controls.js';
import { createLightData, drawOcean } from './js/objects/ocean.js';
import { createFishData, createFishMeshes, drawFish } from './js/objects/fish.js';
import { createBubbleData, drawBubbles } from './js/objects/bubbles.js';
import { createCreatureData, createCreatureMeshes, drawSeaCreature } from './js/objects/seaCreature.js';
import { createPlantData, drawSeaPlant } from './js/objects/plants.js';
import { createCoralData, drawSmallCoral } from './js/objects/corals.js';
import { createSeabedData, createSeabedMeshes, drawSeabed, drawRock, drawStones } from './js/objects/seabed.js';
import { createShellData, drawShell } from './js/objects/shells.js';

const canvas = document.getElementById('canvas');
const aspect = canvas.width / canvas.height;
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const keys = Object.create(null);
export const scene = {
    light: createLightData(), fish: createFishData(), bubbles: createBubbleData(),
    creatures: createCreatureData(), plants: createPlantData(), corals: createCoralData(),
    seabed: createSeabedData(), shells: createShellData()
};

const initialScene = structuredClone(scene);
export const state = { time: 0, speed: 1, paused: motionPreference.matches, showPivots: false };

let renderer;
let previousTimestamp = null;
let animationFrame = null;
let contextLost = false;

export function update(deltaTime) {
    // Input memakai detik nyata, tidak dipengaruhi pause/speed animasi otomatis.
    updateControls(scene.fish[0], keys, deltaTime);
    if (!state.paused) {
        const elapsed = deltaTime * state.speed;
        state.time += elapsed;
    }
}

export function draw() {
    const { gl } = renderer;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.06, 0.11, 0.2, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Painter's algorithm: urutan asli dipertahankan, tanpa depth buffer.
    drawOcean(renderer, scene.light, state.time);
    drawBubbles(renderer, scene.bubbles, state.time, 'back', aspect);
    scene.plants.forEach(plant => drawSeaPlant(renderer, plant, state.time));
    scene.corals.forEach(coral => drawSmallCoral(renderer, coral, state.time));
    scene.fish.forEach((fish, i) => drawFish(renderer, fish, state.time, state.showPivots));
    drawSeabed(renderer, scene.seabed);
    scene.creatures.forEach((creature, i) => {
        if (creature.layer === 'back') drawSeaCreature(renderer, creature, state.time);
    });
    drawRock(renderer, scene.seabed);
    scene.shells.forEach(shell => drawShell(renderer, shell, state.time));
    drawStones(renderer);
    drawBubbles(renderer, scene.bubbles, state.time, 'front', aspect);
}

function render(timestamp) {
    if (contextLost) return;
    const deltaTime = previousTimestamp === null ? 0
        : Math.min(Math.max((timestamp - previousTimestamp) / 1000, 0), 0.1);
    previousTimestamp = timestamp;
    update(deltaTime);
    draw();
    animationFrame = requestAnimationFrame(render);
}

export function resetScene(paused = motionPreference.matches) {
    clearKeys(keys);
    Object.assign(scene, structuredClone(initialScene));
    Object.assign(state, { time: 0, speed: 1, paused, showPivots: false });
    previousTimestamp = null;
    update(0);
}

function setPaused(paused) {
    state.paused = paused;
    previousTimestamp = null;
}

// Pesan hanya muncul jika canvas tidak dapat dirender.
function showError(message) {
    let error = document.getElementById('graphics-error');
    if (!message) { error?.remove(); return; }
    if (!error) {
        error = document.createElement('p');
        error.id = 'graphics-error';
        error.setAttribute('role', 'alert');
        document.querySelector('.controls').prepend(error);
    }
    error.textContent = message;
}

function init() {
    renderer = initWebGL(canvas);
    // Geometry/buffer dibuat sekali, lalu digunakan ulang pada setiap draw.
    renderer.meshes = {
        ...createPrimitives(renderer), ...createFishMeshes(renderer),
        ...createCreatureMeshes(renderer), ...createSeabedMeshes(renderer)
    };
    contextLost = false;
    previousTimestamp = null;
    showError('');
    cancelAnimationFrame(animationFrame);
    render(performance.now());
}

setupControls(canvas, keys, {
    isAvailable: () => !contextLost,
    pause: () => setPaused(!state.paused),
    resetFish: () => resetFishTransform(scene.fish[0], initialScene.fish[0]),
    resetScene: () => resetScene(),
    referencePose: () => resetScene(true),
    togglePivots: () => { state.showPivots = !state.showPivots; },
    changeSpeed: amount => { state.speed = Math.max(0.25, Math.min(2, state.speed + amount)); },
    resetClock: () => { previousTimestamp = null; }
});
motionPreference.addEventListener('change', event => {
    if (event.matches) setPaused(true);
});
canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    clearKeys(keys);
    contextLost = true;
    cancelAnimationFrame(animationFrame);
    showError('Koneksi grafis terputus. Menunggu WebGL2 pulih…');
});
canvas.addEventListener('webglcontextrestored', () => {
    try { init(); }
    catch (error) { contextLost = true; showError(error.message); }
});

try { init(); }
catch (error) { contextLost = true; console.error(error); showError(error.message); }