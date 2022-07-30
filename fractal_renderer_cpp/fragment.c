#version 110

varying vec2 position;
void main() {
    gl_FragColor = vec4(position.x, position.y, 0., 1.);
}
