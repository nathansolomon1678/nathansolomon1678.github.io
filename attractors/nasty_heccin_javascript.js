"use strict"
window.addEventListener("load", onload, false);

var gl;
var program;
var vertexBuffer;
var canvas;
var a = 0;
var b = 0;
var c = 0;
var d = 0;

function setConstants() {
  a = document.getElementById("A").value;
  b = document.getElementById("B").value;
  c = document.getElementById("C").value;
  d = document.getElementById("D").value;
}

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
  redraw();
}

function redraw() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  setConstants();

  var points = []
  for (var i = 0; i < 50000; i++) {
    var new_point = randomPoint();
    new_point = [new_point[0] * Math.max(canvas.width, canvas.height) / canvas.width  / 2.,
                 new_point[1] * Math.max(canvas.width, canvas.height) / canvas.height / 2.];
    points.push(new_point[0], new_point[1]);
  }
  const vertexArray = new Float32Array(points);
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
  var vertexNumComponents = 2;
  var vertexCount = vertexArray.length / vertexNumComponents;
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  var aVertexPosition = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(aVertexPosition);
  gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(program);
  gl.drawArrays(gl.POINTS, 0, vertexCount);
}

function getRenderingContext() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  var gl = canvas.getContext("webgl2") || canvas.getContext("experimental-webgl");
  if (!gl) {
    alert("Your browser or device may not support WebGL");
  }
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0., 0., 0., 1.);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return gl;
}

function randomPoint() {
  var coords = [
    Math.random() * 2. - 1.,
    Math.random() * 2. - 1.,
  ];
  for (var i = 0; i < 10; i++) {
    coords = clifford(coords);
  }
  return coords;
}

function clifford(point) {
  return [Math.sin(a * point[1]) + c * Math.cos(a * point[0]),
          Math.sin(b * point[0]) + d * Math.cos(b * point[1])];
}

function hideSidebar() {
  document.getElementById("theDivWithAllTheStuff").style.display = "none";
  document.getElementById("openSidebarButton").style.display = "block";
}
function openSidebar() {
  document.getElementById("theDivWithAllTheStuff").style.display = "block";
  document.getElementById("openSidebarButton").style.display = "none";
}
