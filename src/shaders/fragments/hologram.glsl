// Futuristic Hologram Shader
// Creates a sci-fi holographic effect with scan lines, glitch effects,
// and color shifting based on displacement

uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;
uniform float scanLineSpeed;
uniform float glitchIntensity;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;
varying float vDisplacement;

// Noise function for glitch effect
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    // Create scan lines effect
    float scanLine = sin(vUv.y * resolution.y * 0.5 + time * scanLineSpeed) * 0.5 + 0.5;
    scanLine = pow(scanLine, 2.0); // Make scan lines more defined
    
    // Create glitch effect
    float glitch = random(vec2(vUv.y + time)) * glitchIntensity;
    glitch = step(0.9, glitch); // Make glitch more dramatic
    
    // Create color shift based on displacement
    vec3 baseColor = vec3(0.0, 0.8, 1.0); // Cyan base color
    vec3 colorShift = vec3(1.0, 0.0, 0.8); // Pink shift color
    
    // Mix colors based on displacement and time
    vec3 finalColor = mix(baseColor, colorShift, 
        abs(sin(vDisplacement * 2.0 + time * 0.5)) * 0.5 + 0.5);
    
    // Add fresnel effect for holographic look
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
    finalColor += fresnel * 0.5;
    
    // Apply scan lines
    finalColor *= scanLine * 0.8 + 0.2; // Keep some base brightness
    
    // Add glitch effect
    if (glitch > 0.0) {
        finalColor = mix(finalColor, vec3(1.0), glitch);
        finalColor.r = mix(finalColor.r, random(vec2(time)), glitch);
    }
    
    // Add edge glow
    float edgeGlow = pow(fresnel, 2.0) * 0.5;
    finalColor += edgeGlow * vec3(0.0, 0.8, 1.0);
    
    // Add subtle noise for more holographic feel
    float noise = random(vUv + time * 0.1) * 0.1;
    finalColor += noise;
    
    // Final color with alpha for transparency
    gl_FragColor = vec4(finalColor, 0.8 - fresnel * 0.3);
}
