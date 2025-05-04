// Built-in uniforms
// uniform mat4 viewMatrix;
// uniform vec3 cameraPosition;

varying float vDisplacement;
varying vec3 vPosition;

void main() {
    vec3 red = vec3(1.0, 0.0, 0.0);
    vec3 blue = vec3(0.0, 0.0, 1.0);

    float gradient = vPosition.y * 0.4;
    gradient = smoothstep(-1.0, 1.0, gradient);

    vec3 color = mix(blue, red, gradient);

    gl_FragColor = vec4(color * (vDisplacement * 1.5), 1.0);
}
