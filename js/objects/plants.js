import { IDENTITY, transform } from '../../matrix3.js';
import { drawPolygon, drawEllipse, drawLine } from '../primitives.js';

// Generating data for plants objects.
export function createPlantData() {
    return [
        { x: -0.81, y: -0.62, scaleX: 0.42, scaleY: 0.71, rotation: 0.08, color: "#a34f64", highlight: "#ce7180" },
        { x: -0.70, y: -0.48, scaleX: 0.46, scaleY: 0.69, rotation: -0.025, color: "#ae5668", highlight: "#d27b88" },
        { x: 0.81, y: -0.77, scaleX: 0.42, scaleY: 0.70, rotation: 0.02, color: "#d98198", highlight: "#f3a7b4" },
        { x: 0.64, y: -0.83, scaleX: 0.31, scaleY: 0.49, rotation: 0.18, color: "#d2708d", highlight: "#ea92a7" }
    ];
}

const STEM = [[0,0],[-0.07,0.18],[-0.13,0.36],[-0.025,0.57],[0.09,0.78],[0.065,1.00]];
const BRANCHES = [
    { at:1, length:0.23, width:0.38, angle:0.95 },
    { at:1, length:0.19, width:0.25, angle:-0.90 },
    { at:2, length:0.30, width:0.42, angle:1.00 },
    { at:2, length:0.20, width:0.26, angle:-0.75 },
    { at:3, length:0.30, width:0.40, angle:-0.88 },
    { at:4, length:0.27, width:0.44, angle:1.10 },
    { at:4, length:0.18, width:0.26, angle:-0.72 },
    { at:5, length:0.24, width:0.31, angle:0.13 }
];

export function drawSeaPlant(renderer, plant, time = 0, branches = BRANCHES) {
    const { meshes } = renderer;
    // Adding swaying motion based on time and plant position for animation.
    const sway = Math.sin(time * 2 + plant.x * 10) * 0.05;
    const root = transform(IDENTITY, plant.x, plant.y, plant.scaleX, plant.scaleY, plant.rotation + sway);
    
    for (let i = 0; i < STEM.length - 1; i++) {
        const width = 0.045 - i * 0.005;
        // You can optionally create a stem with a gradual curve, but for simplicity, we will let the roots swing.
        drawLine(renderer, root, STEM[i], STEM[i+1], width, plant.color);
        drawEllipse(renderer, root, ...STEM[i], width, width, plant.color);
    }
    
    for (const branch of branches) {
        // Local leaf rotation is inherited to the plant root along with its scaling.
        const [x,y] = STEM[branch.at];
        const leafSway = Math.cos(time * 3 + branch.at + plant.x * 10) * 0.1;
        const leaf = transform(root, x, y, branch.width, branch.length, branch.angle + leafSway);
        drawPolygon(renderer, meshes.leaf, leaf, plant.color);
        drawPolygon(renderer, meshes.leaf, transform(leaf, -0.018, 0.065, 0.67, 0.90), plant.highlight, 0.5);
        drawLine(renderer, leaf, [0,0.08], [-0.025,0.87], 0.025, plant.highlight, 0.6);
    }
}