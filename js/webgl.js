export function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(message);
    }
    return shader;
}

export function initWebGL(canvas) {
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: true });
    if (!gl) throw new Error("WebGL2 tidak tersedia. Coba Chrome, Edge, atau Firefox dengan akselerasi grafis aktif.");
    const vertex = compileShader(gl, gl.VERTEX_SHADER, `#version 300 es
        in vec2 a_position;
        uniform mat3 u_matrix;
        out vec2 v_world;
        void main() {
            vec3 world = u_matrix * vec3(a_position, 1.0);
            v_world = world.xy;
            gl_Position = vec4(world.xy, 0.0, 1.0);
        }
    `);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, `#version 300 es
        precision mediump float;
        uniform vec4 u_color;
        uniform bool u_ocean;
        uniform vec2 u_lightSource;
        uniform vec3 u_lightColor;
        uniform float u_lightIntensity;
        in vec2 v_world;
        out vec4 outColor;

        float lightBeam(vec2 point, float slope, float width) {
            // Berkas turun ke kiri, melebar dan memudar semakin jauh dari sumber.
            float depth = max(u_lightSource.y - point.y, 0.0);
            float centerX = u_lightSource.x - depth * slope;
            float halfWidth = width + depth * 0.055;
            float edge = 1.0 - smoothstep(halfWidth * 0.15, halfWidth,
                abs(point.x - centerX));
            float fade = 1.0 - smoothstep(0.15, 2.65, depth);
            return edge * fade;
        }

        void main() {
            outColor = u_color;
            if (u_ocean) {
                // Hanya campuran warna 2D: cahaya datang dari kanan atas.
                float light = clamp(0.48 + 0.35*v_world.x + 0.30*v_world.y, 0.0, 1.0);
                vec3 deep = vec3(0.045, 0.12, 0.245);
                vec3 middle = vec3(0.21, 0.365, 0.48);
                vec3 shallow = vec3(0.72, 0.70, 0.74);
                vec3 water = mix(deep, middle, smoothstep(0.0, 0.75, light));
                water = mix(water, shallow, smoothstep(0.50, 1.15, light));
                float glow = 1.0 - smoothstep(0.0, 1.35, distance(v_world, u_lightSource));
                float rays = lightBeam(v_world, 0.48, 0.065) * 0.65
                           + lightBeam(v_world, 0.83, 0.110) * 0.50
                           + lightBeam(v_world, 1.18, 0.080) * 0.40;
                float illumination = clamp((glow * 0.55 + rays) * u_lightIntensity, 0.0, 1.0);
                outColor = vec4(mix(water, u_lightColor, illumination), 1.0);
            }
        }
    `);
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const message = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(message);
    }
    gl.useProgram(program);
    const uniforms = {
        matrix: gl.getUniformLocation(program, "u_matrix"),
        color: gl.getUniformLocation(program, "u_color"),
        ocean: gl.getUniformLocation(program, "u_ocean"),
        lightSource: gl.getUniformLocation(program, "u_lightSource"),
        lightColor: gl.getUniformLocation(program, "u_lightColor"),
        lightIntensity: gl.getUniformLocation(program, "u_lightIntensity")
    };
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    return { gl, program, uniforms };
}

export function createMesh(renderer, vertices, mode = renderer.gl.TRIANGLES) {
    const { gl, program } = renderer;
    // Vertex buffer dibuat sekali. VAO menyimpan cara membaca pasangan x,y.
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    return { vao, buffer, count: vertices.length / 2, mode };
}