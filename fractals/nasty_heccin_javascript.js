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
var julify = false;
var mouse_is_down = false;
var moved_mouse_since_last_click = false;

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
    alert(gl.getProgramInfoLog(program));
  } 
  initializeAttributes();
  redraw();
}

function redraw() {
  gl.uniform2fv(gl.getUniformLocation(program, "canvas_dimensions"), [canvas.clientWidth, canvas.clientHeight]);
  gl.uniform2fv(gl.getUniformLocation(program, "center"), [center_x, center_y]);
  gl.uniform2fv(gl.getUniformLocation(program, "crosshair"), [crosshair_x, crosshair_y]);
  gl.uniform1f(gl.getUniformLocation(program, "scale_factor"), scale_factor);
  gl.uniform1i(gl.getUniformLocation(program, "coloring_method"), document.getElementById("coloring method").value);
  gl.uniform1i(gl.getUniformLocation(program, "max_iterations"), document.getElementById("max iterations").value);
  gl.uniform1f(gl.getUniformLocation(program, "divergence_threshold"), document.getElementById("divergence threshold").value);
  gl.uniform1i(gl.getUniformLocation(program, "fractal_type"), document.getElementById("fractal type").value);
  gl.uniform1i(gl.getUniformLocation(program, "julify"), julify);
  gl.uniform1i(gl.getUniformLocation(program, "colorscheme"), document.getElementById("colorscheme").value);
  gl.uniform1f(gl.getUniformLocation(program, "colorfulness"), document.getElementById("colorfulness").value);
  gl.uniform1f(gl.getUniformLocation(program, "color_offset"), document.getElementById("color offset").value / 100);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  document.getElementById("display view settings").innerHTML =
    "Scale factor: "      + scale_factor.toPrecision(3) + "<br>" +
    "Center coords: ("    + center_x.toFixed(5)    + ", " + center_y.toFixed(5) + ")<br>" +
    "Crosshair coords: (" + crosshair_x.toFixed(5) + ", " + crosshair_y.toFixed(5) + ")";
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
  document.getElementById("openSidebarButton").style.display = "block";
}

function openSidebar() {
  document.getElementById("theDivWithAllTheStuff").style.display = "block";
  document.getElementById("openSidebarButton").style.display = "none";
}

function toggle_julia_set() {
  julify = !julify;
  redraw();
  document.getElementById("julify").innerHTML = julify ? "Show original" : "Show Julia set";
}

function setMouseCoords() {
  mouse_x = (2 * (event.pageX - event.target.offsetLeft) - canvas.clientWidth ) / Math.min(canvas.clientWidth, canvas.clientHeight);
  mouse_y = (2 * (event.pageY - event.target.offsetTop ) - canvas.clientHeight) / Math.min(canvas.clientWidth, canvas.clientHeight);
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
  if (!julify) {
    setMouseCoords();
    crosshair_x = mouse_x;
    crosshair_y = mouse_y;
    redraw();
  }
}

function mouse_down(event) {
  if (event.button == 0) {
    mouse_is_down = true;
    moved_mouse_since_last_click = false;
  }
  setMouseCoords(event);
}
function mouse_up(event) {
  mouse_is_down = false;
  if (event.button == 0 && !moved_mouse_since_last_click) {
    set_crosshair();
  }
}
function mouse_move(event) {
  if (mouse_is_down) {
    moved_mouse_since_last_click = true;
    var old_mouse_x = mouse_x;
    var old_mouse_y = mouse_y;
    setMouseCoords(event);
    center_x += old_mouse_x - mouse_x;
    center_y += old_mouse_y - mouse_y;
    center_x = clamp(center_x, -10, 10);
    center_y = clamp(center_y, -10, 10);
    setMouseCoords(event);
    redraw();
  }
}
