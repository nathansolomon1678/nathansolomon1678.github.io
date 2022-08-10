#define GLFW_INCLUDE_NONE
#include <GLFW/glfw3.h>

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

static int width =  1920 * 5;
static int height = 1080 * 5;
static float canvas_dimensions[] = {(float) width, (float) height};

// FRACTAL PARAMETERS (default values)
static int fractal_type = 0;
static int coloring_method = 0;
static int max_iterations = 20;
static float divergence_threshold = 20;
static int colorscheme = 0;
static int colorfulness = 20;
static float color_offset = 0;
static bool julify = false;
static float scale_factor = 1;
static float center[2] = {0, 0};
static float crosshair[2] = {0, 0};
static float heartiness = 0;
static float rotation_degrees = 0;

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
 
static void error_callback(int error, const char* description) {
    fprintf(stderr, "Error: %s\n", description);
}

void saveImage(char* filepath) {
    GLsizei nrChannels = 3;
    GLsizei stride = nrChannels * width;
    stride += (stride % 4) ? (4 - stride % 4) : 0;
    GLsizei bufferSize = stride * height;
    std::vector<char> buffer(bufferSize);
    glPixelStorei(GL_PACK_ALIGNMENT, 4);

    glReadPixels(0, 0, width, height, GL_RGB, GL_UNSIGNED_BYTE, buffer.data());
    stbi_flip_vertically_on_write(true);
    stbi_write_png(filepath, width, height, nrChannels, buffer.data(), stride);
}
 
int main(int argc, char* argv[]) {
    // Begin by getting values from all the flags
    for (int i = 1; i < argc; ++i) {
        if (!strcmp(argv[i], "-fractal-type")) {
            fractal_type = atoi(argv[i + 1]);
            ++i;
        } else if (!strcmp(argv[i], "-coloring-method")) {
            coloring_method = atoi(argv[i + 1]);
            ++i;
        } else if (!strcmp(argv[i], "-max-iterations")) {
            max_iterations = atoi(argv[i + 1]);
            ++i;
        } else if (!strcmp(argv[i], "-divergence-threshold")) {
            divergence_threshold = atof(argv[i + 1]);
            ++i;
        } else if (!strcmp(argv[i], "-colorscheme")) {
            colorscheme = atoi(argv[i + 1]);
            ++i;
        } else if (!strcmp(argv[i], "-colorfulness")) {
            colorfulness = atoi(argv[i + 1]);
            ++i;
        } else if (!strcmp(argv[i], "-color-offset")) {
            color_offset = atof(argv[i + 1]);
            ++i;
        } else if (!strcmp(argv[i], "-julify")) {
            julify = true;
        } else if (!strcmp(argv[i], "-scale-factor")) {
            scale_factor = atof(argv[i + 1]);
            ++i;
        } else if (!strcmp(argv[i], "-center-x")) {
            center[0] = atof(argv[i + 1]);
            ++i;
        } else if (!strcmp(argv[i], "-center-y")) {
            center[1] = atof(argv[i + 1]);
            ++i;
        } else if (!strcmp(argv[i], "-crosshair-x")) {
            crosshair[0] = atof(argv[i + 1]);
            ++i;
        } else if (!strcmp(argv[i], "-crosshair-y")) {
            crosshair[1] = atof(argv[i + 1]);
            ++i;
        } else if (!strcmp(argv[i], "-heartiness")) {
            heartiness = atof(argv[i + 1]);
            ++i;
        } else if (!strcmp(argv[i], "-rotation-degrees")) {
            rotation_degrees = atof(argv[i + 1]);
            ++i;
        } else {
            std::cout << "unrecognized option " << argv[i] << ", Terminating program..." << std::endl;
            return 1;
        }
    }

    // Create window, compile shaders, and link the program
    GLFWwindow* window;

    GLuint vertex_buffer, vertex_shader, fragment_shader, program;
    GLint vpos_location;

    glfwSetErrorCallback(error_callback);

    if (!glfwInit()) {
        exit(EXIT_FAILURE);
    }

    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 2);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 0);
    glfwWindowHint(GLFW_DOUBLEBUFFER, GL_FALSE);
    glfwWindowHint(GLFW_VISIBLE, GL_FALSE);

    window = glfwCreateWindow(width, height, "Escape-time fractals", NULL, NULL);
    if (!window) {
        glfwTerminate();
        exit(EXIT_FAILURE);
    }
    glfwMakeContextCurrent(window);
 
    glGenBuffers(1, &vertex_buffer);
    glBindBuffer(GL_ARRAY_BUFFER, vertex_buffer);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
 
    // Compile vertex shader
    vertex_shader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertex_shader, 1, &vertex_shader_c_str, NULL);
    glCompileShader(vertex_shader);
 
    // Compile fragment shader
    fragment_shader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragment_shader, 1, &fragment_shader_c_str, NULL);
    glCompileShader(fragment_shader);
 
    // Compile & link program
    program = glCreateProgram();
    glAttachShader(program, vertex_shader);
    glAttachShader(program, fragment_shader);
    glLinkProgram(program);
    glDetachShader(program, vertex_shader);
    glDetachShader(program, fragment_shader);
    glDeleteShader(vertex_shader);
    glDeleteShader(fragment_shader);
 
    vpos_location = glGetAttribLocation(program, "vPos");
 
    glEnableVertexAttribArray(vpos_location);
    glVertexAttribPointer(vpos_location, 2, GL_FLOAT, GL_FALSE,
                          sizeof(vertices[0]), (void*) 0);

    glViewport(0, 0, width, height);
    glClear(GL_COLOR_BUFFER_BIT);
 
    glUseProgram(program);

    glUniform2fv(glGetUniformLocation(program, "canvas_dimensions"), 1, canvas_dimensions);
    glUniform2fv(glGetUniformLocation(program, "center"), 1, center);
    glUniform2fv(glGetUniformLocation(program, "crosshair"), 1, crosshair);
    glUniform1f( glGetUniformLocation(program, "scale_factor"), scale_factor);
    glUniform1i( glGetUniformLocation(program, "coloring_method"), coloring_method);
    glUniform1i( glGetUniformLocation(program, "max_iterations"), max_iterations);
    glUniform1f( glGetUniformLocation(program, "divergence_threshold"), divergence_threshold);
    glUniform1i( glGetUniformLocation(program, "fractal_type"), fractal_type);
    glUniform1i( glGetUniformLocation(program, "julify"), julify);
    glUniform1i( glGetUniformLocation(program, "colorscheme"), colorscheme);
    glUniform1f( glGetUniformLocation(program, "colorfulness"), colorfulness);
    glUniform1f( glGetUniformLocation(program, "color_offset"), color_offset);
    glUniform1f( glGetUniformLocation(program, "heartiness"), heartiness);
    glUniform1f( glGetUniformLocation(program, "rotation_degrees"), rotation_degrees);

    glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
    glfwPollEvents();

    char filepath[] = "frame.png"; 
    saveImage(filepath);

    glfwDestroyWindow(window);
    glfwTerminate();
 
    exit(EXIT_SUCCESS);
}
