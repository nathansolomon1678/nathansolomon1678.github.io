"use strict"

// TODO: add "download image" button
// TODO: add CSS, but ideally don't make the canvases full size
// TODO: add explanation of steganography and analysis

var filename;

window.addEventListener("load", onload_html, false);
var old_canvas;
var old_ctx;
var new_canvas;
var new_ctx;
function onload_html() {
    old_canvas = document.getElementById("original-img");
    old_ctx    = old_canvas.getContext("2d");
    new_canvas = document.getElementById("modified-img");
    new_ctx    = new_canvas.getContext("2d");
    old_ctx.font = "20px sans-serif";
    old_ctx.fillStyle = "white";
    old_ctx.textAlign = "center";
    old_ctx.fillText("No image uploaded yet", old_canvas.width / 2, old_canvas.height / 2);
}

function binary_to_utf8(binary_str) {
    var byte_arr = new Uint8Array(Math.floor(binary_str.length / 8));
    for (var i = 0; i < byte_arr.length; i++) {
        var value = 0;
        for (var j = 0; j < 8; j++) {
            if (binary_str[i * 8 + j] == '1') {
                value += 1 << (7 - j);
            }
        }
        byte_arr[i] = value;
    }
    const decoder = new TextDecoder();
    return decoder.decode(byte_arr);
}

function utf8_to_binary(utf8_str) {
    const encoder = new TextEncoder();
    var byte_arr = encoder.encode(utf8_str);
    var binary_str = "";
    for (var i = 0; i < byte_arr.length; i++) {
        binary_str += byte_arr[i].toString(2).padStart(8, '0');
    }
    return binary_str;
}


function get_message() {
    const img_data = old_ctx.getImageData(0, 0, old_canvas.width, old_canvas.height);
    var binary_str = "";
    for (var i = 0; i < img_data.data.length; i++) {
        if (i % 4 == 3) { continue; }  // Assume alpha value is the same for all pixels, so changing that would be suspicious
        binary_str += img_data.data[i] % 2;
    }
    document.getElementById("current-message").value = binary_to_utf8(binary_str);
}

function change_input_file() {
    const file = document.getElementById("input-file").files[0];
    if (file) {
        document.getElementById("current-message").value = "Loading...";
        filename = file.name;
        var img = new Image();
        const file_reader = new FileReader();
        file_reader.readAsDataURL(file);
        file_reader.onload = function() {
            img.src = this.result;
            img.onload = function() {
                const max_chars_hidden = Math.floor(img.width * img.height * 3 / 8);
                document.getElementById("img-dimensions").innerHTML = "Image dimensions: " + img.width + " by " + img.height +
                    " pixels. This is enough to hide a " + max_chars_hidden + " byte message.";
                document.getElementById("current-message").maxLength = max_chars_hidden;
                document.getElementById("new-message").maxLength = max_chars_hidden;
                old_canvas.width = img.width;
                old_canvas.height = img.height;
                old_ctx.drawImage(img, 0, 0);
                get_message();
            };
        };
    } else {
        alert("File could not be uploaded correctly.");
    }
}

function download_img() {
    if (!document.getElementById("input-file").files[0]) {
        alert("You have not yet uploaded an image to hide your message within.");
        return;
    }
    var binary_str = utf8_to_binary(document.getElementById("new-message").value);
    if (binary_str.length > (old_canvas.height * old_canvas.width * 3)) {
        alert("That message is too long to be hidden in your image.");
        return;
    }
    new_canvas.width  = old_canvas.width;
    new_canvas.height = old_canvas.height;
    var img_data = old_ctx.getImageData(0, 0, old_canvas.width, old_canvas.height);
    for (var i = 0; i < binary_str.length; i++) {
        const index = (i % 3) + 4 * Math.floor(i / 3);
        img_data.data[index] -= img_data.data[index] % 2;
        if (binary_str[i] == '1') {
            img_data.data[index] += 1;
        }
    }
    new_ctx.putImageData(img_data, 0, 0);

    var img = new_canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    var link = document.createElement('a');
    link.download = filename;
    link.href = img;
    link.click();
}
