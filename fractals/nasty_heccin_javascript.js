"use strict"
window.addEventListener("load", setupWebGL, false);

var gl;
var program;
var mouseX = 0;
var mouseY = 0;
var vertexBuffer;

function setupWebGL (evt) {
  window.removeEventListener(evt.type, setupWebGL, false);
  if (!(gl = getRenderingContext()))
    return;

  var source = document.getElementById("vert-shader").innerHTML;
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader,source);
  gl.compileShader(vertexShader);
  console.log(gl.getShaderInfoLog(vertexShader));
  source = document.getElementById("frag-shader").innerHTML;
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader,source);
  gl.compileShader(fragmentShader);
  console.log(gl.getShaderInfoLog(fragmentShader));
  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    var linkErrLog = gl.getProgramInfoLog(program);
    document.querySelector("p").innerHTML = 
      "Shader program did not link successfully. "
      + "Error log: " + linkErrLog;
    return;
  } 
  initializeAttributes();
  document.getElementById("theCanvas").addEventListener("mousemove", function(event) {
    var canvas = document.querySelector("canvas");
    var scale_factor = Math.exp(document.getElementById("logScaleFactor").value);
    // TODO: alert if screen dimensions are too small, advising users to use a computer instead
    mouseX = (2 * (event.pageX - event.target.offsetLeft) - canvas.width ) / canvas.width  / scale_factor;
    mouseY = (2 * (event.pageY - event.target.offsetTop ) - canvas.height) / canvas.height / scale_factor;
    mouseY *= -1;
    redraw();
  }, false);
}

function redraw() {
  var canvas = document.querySelector("canvas");
  gl.uniform2fv(gl.getUniformLocation(program, "complex_constant"), [mouseX, mouseY]);
  var coloring_method = document.getElementById("coloringMethod").value;
  var fractal_type = document.getElementById("fractalType").value;
  var julify = document.getElementById("julify").checked ? 1 : 0;
  var scale_factor = Math.exp(document.getElementById("logScaleFactor").value);
  var max_iterations = document.getElementById("maxIters").value;
  var log_divergence_limit = document.getElementById("logDivergenceLimit").value;
  gl.uniform1i(gl.getUniformLocation(program, "coloring_method"), coloring_method);
  gl.uniform2fv(gl.getUniformLocation(program, "canvas_dimensions"), [canvas.width, canvas.height]);
  gl.uniform1f(gl.getUniformLocation(program, "scale_factor"), scale_factor);
  gl.uniform1i(gl.getUniformLocation(program, "max_iterations"), max_iterations);
  gl.uniform1f(gl.getUniformLocation(program, "log_divergence_limit"), log_divergence_limit);
  gl.uniform1i(gl.getUniformLocation(program, "fractal_type"), fractal_type);
  gl.uniform1i(gl.getUniformLocation(program, "julify"), julify);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}


function initializeAttributes() {
  const vertexArray = new Float32Array([-1., -1., 1., -1., 1., 1., -1., 1.]);
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
  var vertexNumComponents = 2;
  var vertexCount = vertexArray.length/vertexNumComponents;
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  var aVertexPosition = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(aVertexPosition);
  gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
  var canvas = document.querySelector("canvas");
  gl.useProgram(program);
}

function getRenderingContext() {
  var canvas = document.querySelector("canvas");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  var gl = canvas.getContext("webgl2") 
    || canvas.getContext("experimental-webgl");
  if (!gl) {
    var paragraph = document.querySelector("p");
    paragraph.innerHTML = "Failed to get WebGL context."
      + "Your browser or device may not support WebGL.";
    return null;
  }
  gl.viewport(0, 0, 
    gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return gl;
}

window.onkeypress = function(event) {
  // When space bar is pressed, toggle visiblity of main div
  if (event.keyCode === 32) {
    var divWithEverything = document.getElementById("theDivWithAllTheStuff");
    var display = divWithEverything.style.display;
    if (display === "block") {
      display = "none";
    } else if (display === "none") {
      display = "block";
    } else {
      console.log(divWithEverything.style.display);
    }
    divWithEverything.style.display = display;
  }
}
