#include <stdlib.h>
#include <stdio.h>
#include <GLES2/gl2.h>
#include <EGL/egl.h>

#include <cmath>
#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>

#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"
#define STBI_MSC_SECURE_CRT
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "stb_image_write.h"

static float canvas_dimensions[] = {1920., 1080.};
static float center[] = {0., 0.};
static float crosshair[] = {-0.7473245747725605, -0.08322114907049437};
static float log_divergence_limit = 2.;


static const struct {
    float x, y;
    float r, g, b;
} vertices[4] = {
    { -1.f, -1.f, 1.f, 0.f, 0.f },
    {  1.f, -1.f, 0.f, 1.f, 0.f },
    {  1.f,  1.f, .5f, 0.f, 0.f },
    { -1.f,  1.f, 0.f, 0.f, 1.f }
};

std::string file_contents(std::string filename) {
    std::stringstream sstream;
    sstream << std::ifstream(filename).rdbuf();
    return sstream.str();
}

static std::string vertex_shader_str     = file_contents("vertex.c");
static const char* vertex_shader_c_str   = vertex_shader_str.c_str();

static std::string fragment_shader_str   = file_contents("fragment.c");
static const char* fragment_shader_c_str = fragment_shader_str.c_str();
 
void saveImage(char* filepath) {
    GLsizei nrChannels = 3;
    GLsizei stride = nrChannels * 1920;
    stride += (stride % 4) ? (4 - stride % 4) : 0;
    GLsizei bufferSize = stride * 1080;
    std::vector<char> buffer(bufferSize);
    glPixelStorei(GL_PACK_ALIGNMENT, 4);

    glReadPixels(0, 0, 1920, 1080, GL_RGB, GL_UNSIGNED_BYTE, buffer.data());
    stbi_flip_vertically_on_write(true);
    stbi_write_png(filepath, 1920, 1080, nrChannels, buffer.data(), stride);
}
 
int main(void) {
    GLuint vertex_buffer, vertex_shader, fragment_shader, program;
    GLint vpos_location;
 
    glGenBuffers(1, &vertex_buffer);
    glBindBuffer(GL_ARRAY_BUFFER, vertex_buffer);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
 
    // Compile vertex shader
    vertex_shader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertex_shader, 1, &vertex_shader_c_str, NULL);
    glCompileShader(vertex_shader);
    GLchar* error_message;
    glGetShaderInfoLog(vertex_shader, 100000, NULL, error_message);
    std::cout << error_message << std::endl;
 
    // Compile fragment shader
    fragment_shader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragment_shader, 1, &fragment_shader_c_str, NULL);
    glCompileShader(fragment_shader);
    glGetShaderInfoLog(fragment_shader, 100000, NULL, error_message);
    std::cout << error_message << std::endl;
 
    // Compile & link program
    program = glCreateProgram();
    glAttachShader(program, vertex_shader);
    glAttachShader(program, fragment_shader);
    glLinkProgram(program);
    glDetachShader(program, vertex_shader);
    glDetachShader(program, fragment_shader);
    glDeleteShader(vertex_shader);
    glDeleteShader(fragment_shader);
    glGetProgramInfoLog(program, 100000, NULL, error_message);
    std::cout << error_message << std::endl;
 
    vpos_location = glGetAttribLocation(program, "vPos");
 
    glEnableVertexAttribArray(vpos_location);
    glVertexAttribPointer(vpos_location, 2, GL_FLOAT, GL_FALSE,
                          sizeof(vertices[0]), (void*) 0);

    glViewport(0, 0, 1920, 1080);
    glClear(GL_COLOR_BUFFER_BIT);
 
    glUseProgram(program);

    glUniform2fv(glGetUniformLocation(program, "canvas_dimensions"), 1, canvas_dimensions);
    glUniform2fv(glGetUniformLocation(program, "center"), 1, center);
    glUniform2fv(glGetUniformLocation(program, "crosshair"), 1, crosshair);
    glUniform1f( glGetUniformLocation(program, "scale_factor"), 2.);
    glUniform1i( glGetUniformLocation(program, "coloring_method"), 0);
    glUniform1i( glGetUniformLocation(program, "max_iterations"), 1000);
    glUniform1f( glGetUniformLocation(program, "divergence_threshold"), exp(log_divergence_limit));
    glUniform1i( glGetUniformLocation(program, "fractal_type"), 0);
    glUniform1i( glGetUniformLocation(program, "julify"), true);
    glUniform1i( glGetUniformLocation(program, "colorscheme"), 2);
    glUniform1f( glGetUniformLocation(program, "colorfulness"), 128);
    glUniform1f( glGetUniformLocation(program, "color_offset"), .72);


    for (int i = 0; i < 10000; ++i) {
        glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
    }

    char filepath[] = "frame.png"; 
    saveImage(filepath);
 
    exit(EXIT_SUCCESS);
}
