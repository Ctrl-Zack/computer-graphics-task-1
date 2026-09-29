import { transform } from '../matrix3.js';
import { createMesh } from './webgl.js';

// Avoid repeated hex parsing.
const colorCache = new Map();
export function rgba(hex, alpha = 1) {
    if (!colorCache.has(hex)) {
        colorCache.set(hex, [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255));
    }
    return [...colorCache.get(hex), alpha];
}

// Function to create a mesh from a convex polygon (converting it to triangles)
export function createPolygon(renderer, points) {
    // convex polygon -> triangle
    const triangles = [];
    for (let i = 1; i < points.length - 1; i++) triangles.push(...points[0], ...points[i], ...points[i + 1]);
    return createMesh(renderer, triangles);
}

// Function to create a circle or ring mesh
export function createCircle(renderer, segments = 48, ring = false) {
    const { gl } = renderer;
    const vertices = ring ? [] : [0, 0];
    for (let i = 0; i <= segments; i++) {
        const angle = i * 2 * Math.PI / segments;
        const x = Math.cos(angle), y = Math.sin(angle);
        vertices.push(x * 0.5, y * 0.5);
        if (ring) vertices.push(x * 0.39, y * 0.39);
    }
    return createMesh(renderer, vertices, ring ? gl.TRIANGLE_STRIP : gl.TRIANGLE_FAN);
}

// Function to create a collection of standard primitives
export function createPrimitives(renderer) {
    // leaf with vertical ellipse
    const leaf = [];
    for (let i = 0; i <= 16; i++) {
        const angle = i * Math.PI * 2 / 16;
        leaf.push([0.18 * Math.sin(angle), 0.5 - 0.5 * Math.cos(angle)]);
    }
    return {
        rectangle: createPolygon(renderer, [[-0.5,-0.5],[0.5,-0.5],[0.5,0.5],[-0.5,0.5]]),
        triangle: createPolygon(renderer, [[0,0],[-1,0.65],[-1,-0.65]]),
        circle: createCircle(renderer),
        ring: createCircle(renderer, 40, true),
        leaf: createPolygon(renderer, leaf.slice(0,-1))
    };
}

// Function to draw a polygon to the screen
export function drawPolygon(renderer, mesh, matrix, color, alpha = 1) {
    const { gl, uniforms } = renderer;
    // activate mesh, send transform & color -> draw
    gl.bindVertexArray(mesh.vao);
    gl.uniformMatrix3fv(uniforms.matrix, false, matrix);
    gl.uniform4fv(uniforms.color, rgba(color, alpha));
    gl.drawArrays(mesh.mode, 0, mesh.count);
}

export function drawRectangle(renderer, matrix, color, alpha = 1) {
    const { meshes } = renderer;
    drawPolygon(renderer, meshes.rectangle, matrix, color, alpha);
}

export function drawTriangle(renderer, matrix, color) {
    const { meshes } = renderer;
    drawPolygon(renderer, meshes.triangle, matrix, color);
}

export function drawCircle(renderer, matrix, color, alpha = 1) {
    const { meshes } = renderer;
    drawPolygon(renderer, meshes.circle, matrix, color, alpha);
}

export function drawEllipse(renderer, parent, x, y, width, height, color, rotation = 0, alpha = 1) {
    drawCircle(renderer, transform(parent, x, y, width, height, rotation), color, alpha);
}

export function drawLine(renderer, parent, a, b, width, color, alpha = 1) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    drawRectangle(renderer, transform(parent, (a[0]+b[0])/2, (a[1]+b[1])/2,
        Math.hypot(dx,dy), width, Math.atan2(dy,dx)), color, alpha);
}