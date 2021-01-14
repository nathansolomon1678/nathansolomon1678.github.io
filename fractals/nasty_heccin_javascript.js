;(function(){
"use strict"
window.addEventListener("load", setupWebGL, false);
var gl,
  program;
function setupWebGL (evt) {
  window.removeEventListener(evt.type, setupWebGL, false);
  if (!(gl = getRenderingContext()))
    return;

  var source = document.getElementById("vert-shader").innerHTML;
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader,source);
  gl.compileShader(vertexShader);
  console.log(gl.getShaderInfoLog(vertexShader));
  source = document.getElementById("frag-shader").innerHTML
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
  document.getElementById("theCanvas").addEventListener("mousemove",
    function (evt) {
      // negate Y coord to make right side up (TODO: might have to flip X coord too? not sure)
      var x_coord =  3 * (2 * (evt.pageX - evt.target.offsetLeft) - gl.drawingBufferWidth ) / gl.drawingBufferWidth;
      var y_coord = -3 * (2 * (evt.pageY - evt.target.offsetTop ) - gl.drawingBufferHeight) / gl.drawingBufferHeight;
      gl.uniform2fv(gl.getUniformLocation(program, "complex_constant"), [x_coord, y_coord]);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }, false);
}

var vertexBuffer
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
  gl.uniform2fv(gl.getUniformLocation(program, "canvas_dimensions"), [canvas.width, canvas.height]);
  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexCount);
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

})();
