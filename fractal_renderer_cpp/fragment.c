#version 110

uniform vec2 crosshair;
uniform vec2 canvas_dimensions;
uniform vec2 center;
uniform float scale_factor;
uniform int max_iterations;
uniform float divergence_threshold;
uniform int fractal_type;
uniform int colorscheme;
uniform float colorfulness;
uniform int coloring_method;
uniform float color_offset;
uniform bool julify;
uniform float heartiness;
uniform float rotation_degrees;

varying vec2 position;

float square(float x) { return x * x; }
float magnitude(vec2 z) {
    return sqrt(square(z.x) + square(z.y));
}
float cubic_interpolation(float a, float b, float c, float d, float x) {
  // Returns f(x), where f is a cubic function, f(-1)=a, f(0)=b, f(1)=c, & f(2)=d
  return b +
         x * (.5 * c - .5 * a) +
         x * x * (a - 2.5 * b + 2. * c - .5 * d) +
         x * x * x * (-.5 * a + 1.5 * b - 1.5 * c + .5 * d);
}

vec3 mix_cubic(vec3 color0, vec3 color1, vec3 color2, vec3 color3, float x) {
  return vec3(cubic_interpolation(color0.r, color1.r, color2.r, color3.r, x),
              cubic_interpolation(color0.g, color1.g, color2.g, color3.g, x),
              cubic_interpolation(color0.b, color1.b, color2.b, color3.b, x));
}

// COLORSCHEMES
vec3 classic_colorscheme(float x) {
  x *= 6.28318530718;
  return vec3(.5 + sin(x     ) / 2.,
              .5 + sin(x + 1.) / 2.,
              .5 + sin(x + 2.) / 2.);
}
vec3 experimental_colorscheme(float x) {
  vec3 navy    = vec3(.1, 0., .3);
  vec3 magenta = vec3(.6, .2, .4);
  vec3 gold    = vec3(1., 1., .7);
  vec3 green   = vec3(.2, .8, .4);
  x = fract(x) * 4.;
       if (x < 1.) { return mix_cubic(magenta, navy   , green  , gold   , fract(x)); }
  else if (x < 2.) { return mix_cubic(navy   , green  , gold   , magenta, fract(x)); }
  else if (x < 3.) { return mix_cubic(green  , gold   , magenta, navy   , fract(x)); }
  else if (x < 4.) { return mix_cubic(gold   , magenta, navy   , green  , fract(x)); }
  else             { return navy; }
}
vec3 rachels_colorscheme(float x) {
  vec3 maroon = vec3(.2, .0, .1);
  vec3 orange = vec3(1., .5, .1);
  vec3 purple = vec3(.1, 0., .3);
  vec3 white  = vec3(1., 1., 1.);
  x = fract(x) * 4.;
       if (x < 1.) { return mix_cubic(purple, maroon, orange, white , fract(x)); }
  else if (x < 2.) { return mix_cubic(maroon, orange, white , purple, fract(x)); }
  else if (x < 3.) { return mix_cubic(orange, white , purple, maroon, fract(x)); }
  else if (x < 4.) { return mix_cubic(white , purple, maroon, orange, fract(x)); }
  else             { return maroon; }
}

vec4 color(float x) {
  float real_colorfulness = colorfulness;
  if (coloring_method == 0 || coloring_method == 1) {
    real_colorfulness /= 5000.;
  } else if (coloring_method == 2) {
    real_colorfulness /= 100.;
  } else {
    real_colorfulness /= 150.;
  }
  x = x * real_colorfulness + color_offset;

  if (colorscheme == 0) {
    return vec4(classic_colorscheme(x), 1);
  } else if (colorscheme == 1) {
    return vec4(experimental_colorscheme(x), 1.);
  } else if (colorscheme == 2) {
    return vec4(rachels_colorscheme(x), 1.);
  }
}

vec2 iterate(vec2 z, vec2 c, int type) {
  if (type == 0) {
    // Mandelbrot
    return c + vec2(2. * z.x * z.y,
                    pow(abs(z.y), 2. - heartiness) - pow(abs(z.x), 2. - heartiness));
  } else if (type == 1) {
    // Burning ship
    return c + vec2(pow(abs(z.x), 2. - heartiness) - pow(abs(z.y), 2. - heartiness),
                    -abs(2. * z.x * z.y));
  }
}

vec2 rotate(vec2 original_vector, float angle_in_degrees) {
    float angle = angle_in_degrees * 3.14159265359 / 180.;
    return vec2(original_vector.x * cos(angle) - original_vector.y * sin(angle),
                original_vector.x * sin(angle) + original_vector.y * cos(angle));
}

void main() {
  vec2 window = canvas_dimensions / min(canvas_dimensions.x, canvas_dimensions.y);
  vec2 original_z = rotate(position * window, rotation_degrees) / scale_factor + center;
  gl_FragColor = vec4(original_z.x, original_z.y, .5, 1.);
  vec2 last_z = original_z;
  vec2 z = original_z;
  float distance_to_orbit_trap = 1000000.;
  for (int i = 0; i <= max_iterations; i++) {
    if (julify) {
      z = iterate(z, crosshair, fractal_type);
    } else {
      z = iterate(z, original_z, fractal_type);
    }
    if (coloring_method == 0) {
      // Color by how many iterations it takes to diverge
      if (magnitude(z) > divergence_threshold) {
        gl_FragColor = color(float(i));
        break;
      } else if (i == max_iterations) {
        gl_FragColor = vec4(0., 0., 0., 1.);
      }
    } else if (coloring_method == 1) {
      // Same as above, but smooth instead of terraced
      if (magnitude(z) > divergence_threshold) {
        float float_iters = float(i) + log(divergence_threshold / magnitude(last_z)) /
                                       log(magnitude(z) / magnitude(last_z));
        gl_FragColor = color(float_iters);
        break;
      } else if (i == max_iterations) {
        gl_FragColor = vec4(0., 0., 0., 1.);
      }
    } else if (coloring_method == 2) {
      // Color by the log of the magnitude after iterating a whole bunch
      if (magnitude(z) > divergence_threshold) {
        gl_FragColor = vec4(0., 0., 0., 1.);
        break;
      } else {
        gl_FragColor = color(log(magnitude(z)));
      }
    } else if (coloring_method == 3) {
      // Color based on how close z gets to a ring around the origin with radius equal to the divergence threshold
      distance_to_orbit_trap = min(distance_to_orbit_trap, abs(magnitude(z) - divergence_threshold));
      gl_FragColor = color(-log(distance_to_orbit_trap));
    }
    last_z = z;
  }
}
