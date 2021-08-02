"use strict"
window.addEventListener("load", onload, false);

var gl;
var program;
var vertexBuffer;
var canvas;

var center_x;
var center_y;
var crosshair_x;
var crosshair_y;
var scale_factor;
var julify;

var mouse_x = 0;
var mouse_y = 0;
var mouse_is_down = false;
var moved_mouse_since_last_click = false;

function onload(event) {
    canvas = document.getElementById("theCanvas");
    if (!(gl = getRenderingContext()))
        return;
    // Vertex and fragment shader source code is stored inside <script> tags of index.html
    var source = document.getElementById("vert-shader").innerText;
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, source);
    gl.compileShader(vertexShader);
    console.log(gl.getShaderInfoLog(vertexShader));

    source = document.getElementById("frag-shader").innerText;
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
    get_URL_params();
    redraw();
}

function redraw() {
    // For number widgets, it's possible to enter a number outside of the range (above the max),
    // but with for max_iterations only, that can cause problems, so we want to block that from happening
    var max_iterations_widget = document.getElementById("max iterations");
    // Below is a perfect example of why everybody hates javascript. It's literally interpreting the value
    // of a number widget as a string :vomit:
    if (parseInt(max_iterations_widget.value) > parseInt(max_iterations_widget.max)) {
        max_iterations_widget.value = max_iterations_widget.max;
    }
    gl.uniform2fv(gl.getUniformLocation(program, "canvas_dimensions"), [canvas.clientWidth, canvas.clientHeight]);
    gl.uniform2fv(gl.getUniformLocation(program, "center"), [center_x, center_y]);
    gl.uniform2fv(gl.getUniformLocation(program, "crosshair"), [crosshair_x, crosshair_y]);
    gl.uniform1f( gl.getUniformLocation(program, "scale_factor"), scale_factor);
    gl.uniform1i( gl.getUniformLocation(program, "coloring_method"), document.getElementById("coloring method").value);
    gl.uniform1i( gl.getUniformLocation(program, "max_iterations"), max_iterations_widget.value);
    gl.uniform1f( gl.getUniformLocation(program, "divergence_threshold"), document.getElementById("divergence threshold").value);
    gl.uniform1i( gl.getUniformLocation(program, "fractal_type"), document.getElementById("fractal type").value);
    gl.uniform1i( gl.getUniformLocation(program, "julify"), julify);
    gl.uniform1i( gl.getUniformLocation(program, "colorscheme"), document.getElementById("colorscheme").value);
    gl.uniform1f( gl.getUniformLocation(program, "colorfulness"), document.getElementById("colorfulness").value);
    gl.uniform1f( gl.getUniformLocation(program, "color_offset"), document.getElementById("color offset").value / 100);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    document.getElementById("display view settings").innerHTML =
        "Scale factor: "      + scale_factor.toPrecision(3) + "<br>" +
        "Center coords: ("    + center_x.toFixed(5)    + ", " + center_y.toFixed(5) + ")<br>" +
        "Crosshair coords: (" + crosshair_x.toFixed(5) + ", " + crosshair_y.toFixed(5) + ")";

    update_link();
}

function initializeAttributes() {
    // This array represents 4 (x,y) points
    // Those points define a single triangle fan, which in this case is a rectangle covering the whole canvas
    // The fragment shader then colors points in that rectangle, so it applies to the whole canvas
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
    gl.clearColor(0., 0., 0., 1.);
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
    document.getElementById("julify").innerText = julify ? "Show original" : "Show Julia set";
}

function setMouseCoords() {
    mouse_x = (2 * (event.pageX - event.target.offsetLeft) - canvas.clientWidth ) / Math.min(canvas.clientWidth, canvas.clientHeight);
    mouse_y = (2 * (event.pageY - event.target.offsetTop ) - canvas.clientHeight) / Math.min(canvas.clientWidth, canvas.clientHeight);
    mouse_y *= -1;  // Because JS canvases are weird
    mouse_x = mouse_x / scale_factor + center_x;
    mouse_y = mouse_y / scale_factor + center_y;
}

function clamp(x, min, max) {
    if (min >= max) { alert("oof"); }
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

function get_URL_params() {
    const parameters = (new URL(window.location.href)).searchParams;
    document.getElementById("fractal type"         ).value = parameters.get("fractal_type")         ?? 0;
    document.getElementById("coloring method"      ).value = parameters.get("coloring_method")      ?? 0;
    document.getElementById("max iterations"       ).value = parameters.get("max_iterations")       ?? 200;
    document.getElementById("divergence threshold" ).value = parameters.get("divergence_threshold") ?? 2;
    document.getElementById("colorscheme"          ).value = parameters.get("colorscheme")          ?? 2;
    document.getElementById("colorfulness"         ).value = parameters.get("colorfulness")         ?? 20;
    document.getElementById("color offset"         ).value = parameters.get("color_offset")         ?? 0;
    julify                                                 =(parameters.get("julify")               ?? false) == "true";
    scale_factor                                = parseFloat(parameters.get("scale_factor")         ?? 1);
    center_x                                    = parseFloat(parameters.get("center_x")             ?? 0);
    center_y                                    = parseFloat(parameters.get("center_y")             ?? 0);
    crosshair_x                                 = parseFloat(parameters.get("crosshair_x")          ?? 0);
    crosshair_y                                 = parseFloat(parameters.get("crosshair_y")          ?? 0);
    if (julify) {
        document.getElementById("julify").innerText = "Show original";
    }
}

function update_link() {
    var url_with_params = new URL("https://nathansolomon1678.github.io/fractals");
    url_with_params.searchParams.append("fractal_type",         document.getElementById("fractal type").value);
    url_with_params.searchParams.append("coloring_method",      document.getElementById("coloring method").value);
    url_with_params.searchParams.append("max_iterations",       document.getElementById("max iterations").value);
    url_with_params.searchParams.append("divergence_threshold", document.getElementById("divergence threshold").value);
    url_with_params.searchParams.append("colorscheme",          document.getElementById("colorscheme").value);
    url_with_params.searchParams.append("colorfulness",         document.getElementById("colorfulness").value);
    url_with_params.searchParams.append("color_offset",         document.getElementById("color offset").value);
    url_with_params.searchParams.append("julify", julify);
    url_with_params.searchParams.append("scale_factor", scale_factor);
    url_with_params.searchParams.append("center_x", center_x);
    url_with_params.searchParams.append("center_y", center_y);
    url_with_params.searchParams.append("crosshair_x", crosshair_x);
    url_with_params.searchParams.append("crosshair_y", crosshair_y);
    document.getElementById("URL").href = url_with_params.href;
    document.getElementById("URL").innerText = url_with_params.href;
}

