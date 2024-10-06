"use strict"

var valid_codes = [];

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

window.addEventListener("load", onload_html, false);
function onload_html() {
    /* As soon as window is loaded, precompute all 3^6=729 valid Golay codes.
     * It wouldn't be horribly impractical to also create a lookup table of
     * the nearest valid Golay code to every possible 11-trit word, since
     * there are only 3^11=177147 such sequences. But for this website, the
     * message to be encoded is limited to 1000 characters anyway, so it makes
     * more sense to compare each 11-trit word to all 729 valid Golay codes
     * until you find a match (that is, a code word that is Hamming distance
     * 2 or less away).
     */
    const basis = ["10000011111", "01000011220", "00100012102", "00010021012", "00001020121", "00000102211"];
    for (let i = 0; i < 3**6; i++) {
        let new_code = "00000000000";
        for (let j = 0; j < 6; j++) {
            let current_component = Math.floor(i / 3**j) % 3;
            if (current_component == 1) {
                new_code = add_words(new_code, basis[j]);
            } else if (current_component == 2) {
                new_code = add_words(new_code, basis[j]);
                new_code = add_words(new_code, basis[j]);
            }
        }
        valid_codes.push(new_code);
    }

    update();
}

function add_words(word1, word2) {
    // Returns the sum of two strings, representing elements of F_3^{11} (an
    // 11-dimensional vector space over the finite field of order 3)
    let sum = "";
    for (let i = 0; i < word1.length; i++) {
        sum += ((parseInt(word1[i]) + parseInt(word2[i])) % 3).toString();
    }
    return sum;
}


function add_noise(encoded_message, error_rate) {
    let noisy_message = "";
    let remaining_trits = encoded_message.replace(" ", "").length;
    let remaining_errors = Math.round(error_rate * remaining_trits);
    for (let i = 0; i < encoded_message.length; i++) {
        if (encoded_message[i] == " ") {
            noisy_message += " ";
            continue;
        }
        if (Math.random() < remaining_errors / remaining_trits) {
            let incorrect_trit = (1 + Math.round(Math.random()) + parseInt(encoded_message[i])) % 3;
            noisy_message += incorrect_trit.toString();
            remaining_errors--;
        } else {
            noisy_message += encoded_message[i];
        }
        remaining_trits--;
    }
    return noisy_message;
}

function color_errors(str1, str2) {
    // Colors characters in str2 red iff they do not match the corresponding characters in str1
    assert(str1.length == str2.length);
    let new_str = "";
    for (let i = 0; i < str1.length; i++) {
        if (str1[i] == str2[i]) {
            new_str += str1[i];
        } else {
            new_str += "<span style=\"color:red;\">" + str2[i] + "</span>";
        }
    }
    return new_str;
}

function hamming_distance(str1, str2) {
    assert(str1.length == str2.length);
    let d = 0;
    for (let i = 0; i < str1.length; i++) {
        if (str1[i] != str2[i]) {
            d++;
        }
    }
    return d;
}

function char_to_int(c) {
    if (c == " ") {
        return 26;
    }
    return c.charCodeAt(0) - 'a'.charCodeAt(0);
}



function update() {
    // Update the HTML displaying the error rate
    document.getElementById("error-rate-display").innerHTML = document.getElementById("error-rate-slider").value + "%";
    const error_rate = document.getElementById("error-rate-slider").value / 100;

    // Validate input message
    let input_box = document.getElementById("original-message");
    let message = input_box.value.replace(/[^a-zA-Z\s]/gi, "");
    if (message.length == 0) {
        message = "hi there";
    }
    message = message.replace(/\s/gi, " ").toLowerCase();
    if (message.length % 2 == 1 && message[-1] == " ") {
        message = message.substring(0, message.length - 1);
    } else if (message.length % 2 == 1) {
        message += " ";
    }
    message = message.substring(0, 1000);
    input_box.value = message;


    // Make simple encoding by converting each character into a 3-trit word
    let encoded_message = "";
    let value = 0;
    for (let i = 0; i < message.length; i++) {
        if (i > 0) {
            encoded_message += " ";
        }
        value = char_to_int(message[i]);
        encoded_message += (Math.floor(value / 9)).toString();
        encoded_message += (Math.floor(value / 3) % 3).toString();
        encoded_message += (value % 3).toString();
    }
    // Add noise to encoded message
    let distorted_message = add_noise(encoded_message, error_rate);
    document.getElementById("simple-encoded").innerHTML = color_errors(encoded_message, distorted_message);

    // Now decode the distorted message
    let decoded_message = "";
    for (let i = 0; i < distorted_message.length; i += 4) {
        value = 9 * parseInt(distorted_message[i]) + 3 * parseInt(distorted_message[i+1]) + parseInt(distorted_message[i+2]);
        decoded_message += "abcdefghijklmnopqrstuvwxyz "[value];
    }
    document.getElementById("simple-decoded").innerHTML = color_errors(message, decoded_message);


    // Now make the Golay encoding
    encoded_message = "";
    for (let i = 0; i < message.length; i += 2) {
        if (i > 0) {
            encoded_message += " ";
        }
        value = 27 * char_to_int(message[i]) + char_to_int(message[i+1]);
        encoded_message += valid_codes[value];
    }
    // Add noise
    distorted_message = add_noise(encoded_message, error_rate);
    document.getElementById("golay-encoded").innerHTML = color_errors(encoded_message, distorted_message);

    // Decode distorted message
    decoded_message = "";
    for (let i = 0; i < distorted_message.length; i += 12) {
        // Find matching Golay code
        let word = distorted_message.substring(i, i + 11);
        value = 0;
        while (hamming_distance(word, valid_codes[value]) > 2) {
            value++;
        }
        decoded_message += "abcdefghijklmnopqrstuvwxyz "[Math.floor(value / 27)];
        decoded_message += "abcdefghijklmnopqrstuvwxyz "[value % 27];
    }
    document.getElementById("golay-decoded").innerHTML = color_errors(message, decoded_message);
}
