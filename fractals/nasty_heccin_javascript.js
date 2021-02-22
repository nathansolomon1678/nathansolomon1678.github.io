"use strict"
window.addEventListener("load", onload, false);

var gl;
var program;
var vertexBuffer;

var canvas;
var mouse_x = 0;
var mouse_y = 0;
var center_x = 0;
var center_y = 0;
var crosshair_x = 0;
var crosshair_y = 0;
var scale_factor = 1.;

function onload(event) {
  canvas = document.getElementById("theCanvas");
  if (!(gl = getRenderingContext()))
    return;
  var source = document.getElementById("vert-shader").innerHTML;
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, source);
  gl.compileShader(vertexShader);
  console.log(gl.getShaderInfoLog(vertexShader));
  source = document.getElementById("frag-shader").innerHTML;
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, source);
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
  redraw();
}

function redraw() {
  var coloring_method = document.getElementById("coloringMethod").value;
  var fractal_type = document.getElementById("fractalType").value;
  var julify = document.getElementById("julify").checked ? 1 : 0;
  var max_iterations = document.getElementById("maxIters").value;
  var colorscheme = document.getElementById("colorscheme").value;
  var colorfullness = document.getElementById("colorfullness").value;
  gl.uniform1i(gl.getUniformLocation(program, "coloring_method"), coloring_method);
  gl.uniform2fv(gl.getUniformLocation(program, "canvas_dimensions"), [canvas.width, canvas.height]);
  gl.uniform2fv(gl.getUniformLocation(program, "center"), [center_x, center_y]);
  gl.uniform2fv(gl.getUniformLocation(program, "crosshair"), [crosshair_x, crosshair_y]);
  gl.uniform1f(gl.getUniformLocation(program, "scale_factor"), scale_factor);
  gl.uniform1i(gl.getUniformLocation(program, "max_iterations"), max_iterations);
  gl.uniform1i(gl.getUniformLocation(program, "fractal_type"), fractal_type);
  gl.uniform1i(gl.getUniformLocation(program, "julify"), julify);
  gl.uniform1i(gl.getUniformLocation(program, "colorscheme"), colorscheme);
  gl.uniform1f(gl.getUniformLocation(program, "colorfullness"), colorfullness);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

  document.getElementById("display view settings").innerHTML =
    "Scale factor: " + scale_factor.toPrecision(3) + "<br>" +
    "Center coords: (" + center_x.toFixed(5) + "," + center_y.toFixed(5) + ")<br>" +
    "Crosshair coords: (" + crosshair_x.toFixed(5) + "," + crosshair_y.toFixed(5) + ")";
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
  gl.useProgram(program);
}

function getRenderingContext() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  var gl = canvas.getContext("webgl2") || canvas.getContext("experimental-webgl");
  if (!gl) {
    alert("Your browser or device may not support WebGL");
  }
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return gl;
}

function hideSidebar() {
  document.getElementById("theDivWithAllTheStuff").style.display = "none";
  document.getElementById("showSidebarButton").style.display = "block";
}

function showSidebar() {
  document.getElementById("theDivWithAllTheStuff").style.display = "block";
  document.getElementById("showSidebarButton").style.display = "none";
}

function setMouseCoords() {
  mouse_x = (2 * (event.pageX - event.target.offsetLeft) - canvas.width ) / Math.min(canvas.width, canvas.height);
  mouse_y = (2 * (event.pageY - event.target.offsetTop ) - canvas.height) / Math.min(canvas.width, canvas.height);
  mouse_y *= -1;  // Because JS canvases are weird
  mouse_x = mouse_x / scale_factor + center_x;
  mouse_y = mouse_y / scale_factor + center_y;
}

function clamp(x, min, max) {
  if (min >= max) { console.log("oof"); }
  if (x < min) { return min; }
  else if (x > max) { return max; }
  else { return x; }
}

function zoom(event) {
  const min_scale_factor = .01;
  const max_scale_factor = 1000000;
  var zoom_factor = Math.exp(-event.deltaY / 500);
  setMouseCoords();
  if (!(scale_factor == min_scale_factor || scale_factor == max_scale_factor)) {
    center_x = mouse_x + (center_x - mouse_x) / zoom_factor;
    center_y = mouse_y + (center_y - mouse_y) / zoom_factor;
  }
  scale_factor *= zoom_factor;
  scale_factor = clamp(scale_factor, min_scale_factor, max_scale_factor)
  center_x = clamp(center_x, -10, 10);
  center_y = clamp(center_y, -10, 10);
  redraw();
}

function set_crosshair() {
  var julify = document.getElementById("julify").checked;
  if (!julify) {
    setMouseCoords();
    crosshair_x = mouse_x;
    crosshair_y = mouse_y;
    redraw();
  }
}

function resize_canvas() {
  // TODO: make this work
  console.log(canvas.clientWidth, canvas.clientHeight);
  redraw();
}

// TODO: add a feature to pan
// TODO: finish descriptions of all the settings
// TODO: use snake case for all variable names? also just clean up code
// TODO: save settings as vars in URL & add button to copy that URL to clipboard
