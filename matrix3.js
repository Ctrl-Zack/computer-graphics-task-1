"use strict";

// Utility object for 3x3 transformation matrix creation
export const Mat3 = {
    identity() {
        return [1, 0, 0,
                0, 1, 0,
                0, 0, 1];
    },
    translation(tx, ty) {
        return [1,  0,  0,
                0,  1,  0,
                tx, ty, 1];
    },
    rotation(rad) {
        const c = Math.cos(rad), s = Math.sin(rad);
        return [c, s, 0,
               -s, c, 0,
                0, 0, 1];
    },
    scaling(sx, sy) {
        return [sx, 0,  0,
                0,  sy, 0,
                0,  0,  1];
    },
    multiply(a, b) {
        const result = new Array(9).fill(0);
        for (let column = 0; column < 3; column++) {
            for (let row = 0; row < 3; row++) {
                for (let k = 0; k < 3; k++) {
                    result[column * 3 + row] += a[k * 3 + row] * b[column * 3 + k];
                }
            }
        }
        return result; 
    }
};

export const IDENTITY = Mat3.identity();
export const radians = degrees => degrees * Math.PI / 180;

// Calculates local transformation and multiplies it with the parent matrix
export function transform(parent, x = 0, y = 0, sx = 1, sy = 1, rotation = 0) {
    const local = Mat3.multiply(Mat3.translation(x, y),
        Mat3.multiply(Mat3.rotation(rotation), Mat3.scaling(sx, sy))); // T R S 
    return Mat3.multiply(parent, local);
}