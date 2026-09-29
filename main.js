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

// Mengambil elemen kanvas dan menghitung rasio aspeknya
const canvas = document.getElementById('canvas');
const aspect = canvas.width / canvas.height;
// Memeriksa preferensi pengguna untuk mengurangi motion
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const keys = Object.create(null);

// Inisialisasi data untuk setiap objek di dalam scene
export const scene = {
    light: createLightData(), fish: createFishData(), bubbles: createBubbleData(),
    creatures: createCreatureData(), plants: createPlantData(), corals: createCoralData(),
    seabed: createSeabedData(), shells: createShellData()
};

// Menyalin status awal scene untuk fungsi reset
const initialScene = structuredClone(scene);
// Menyimpan state global aplikasi
export const state = { time: 0, speed: 1, paused: motionPreference.matches, showPivots: false };

let renderer;
let previousTimestamp = null;
let animationFrame = null;
let contextLost = false;

// Function to update scene logic and state based on time
export function update(deltaTime) {
    // Input uses real-world seconds, unaffected by automatic animation pause/speed.
    updateControls(scene.fish[0], keys, deltaTime);
    if (!state.paused) {
        const elapsed = deltaTime * state.speed;
        state.time += elapsed;
    }
}

// Function to draw all objects on the canvas
export function draw() {
    const { gl } = renderer;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.06, 0.11, 0.2, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Painter's algorithm: original order is preserved, without depth buffer.
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

// Main loop for continuous animation and rendering
function render(timestamp) {
    if (contextLost) return;
    const deltaTime = previousTimestamp === null ? 0
        : Math.min(Math.max((timestamp - previousTimestamp) / 1000, 0), 0.1);
    previousTimestamp = timestamp;
    update(deltaTime);
    draw();
    animationFrame = requestAnimationFrame(render);
}

// Function to reset the entire scene to its initial state
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

// The message only appears if the canvas cannot be rendered.
// Menampilkan pesan error di UI jika grafis gagal dirender
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

// Initial WebGL initialization and mesh creation
function init() {
    renderer = initWebGL(canvas);
    // Geometry/buffer is created once, then reused on every draw.
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

// Menyiapkan kontrol interaktif (tombol/UI)
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
// Menangani kasus saat konteks WebGL terputus
canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    clearKeys(keys);
    contextLost = true;
    cancelAnimationFrame(animationFrame);
    showError('Koneksi grafis terputus. Menunggu WebGL2 pulih…');
});
// Memulihkan WebGL jika koneksi kembali
canvas.addEventListener('webglcontextrestored', () => {
    try { init(); }
    catch (error) { contextLost = true; showError(error.message); }
});

// Memulai aplikasi
try { init(); }
catch (error) { contextLost = true; console.error(error); showError(error.message); }