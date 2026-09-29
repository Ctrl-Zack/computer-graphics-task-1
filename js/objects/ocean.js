import { IDENTITY, transform } from '../../matrix3.js';
import { rgba, drawRectangle } from '../primitives.js';

export function createLightData() {
    return { enabled: true, source: [1.10, 1.15], intensity: 0.38, color: '#e6dfd5' };
}

export function drawOcean(renderer, light, time = 0) {
    const { gl, uniforms } = renderer;
    gl.uniform2fv(uniforms.lightSource, light.source);
    gl.uniform3fv(uniforms.lightColor, rgba(light.color).slice(0,3));
    gl.uniform1f(uniforms.lightIntensity, light.enabled ? light.intensity : 0);
    if (uniforms.time !== null) {
        gl.uniform1f(uniforms.time, time);
    }
    gl.uniform1i(uniforms.ocean, 1);
    drawRectangle(renderer, transform(IDENTITY, 0, 0, 2, 2), "#183754");
    gl.uniform1i(uniforms.ocean, 0);
}