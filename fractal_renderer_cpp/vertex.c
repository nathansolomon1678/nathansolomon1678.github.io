#version 110

attribute vec2 vPos;
varying vec2 position;

void main() {
    gl_Position = vec4(vPos, 0., 1.);
    position = vPos;
}
