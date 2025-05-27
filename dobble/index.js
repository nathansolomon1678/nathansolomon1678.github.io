"use strict"
// TODO: carefully check overall code quality. Use const and let when possible.


// DEFAULT VALUES
var q = 7;
var selected_emojis = new Set();

function shuffle(arr) {
    // Returns a given array in a random order
    return arr.sort(() => Math.random() - 0.5);
}

window.addEventListener("load", load_window, false);
function load_window() {
    create_emoji_menu();
    get_url_params();
}

function get_url_params() {
    let url_params = (new URL(window.location.href)).searchParams;
    if (url_params.has('q')) {
        q = parseInt(url_params.get('q'));
        document.getElementById("q-select").value = q;
    }
    var emojis = "";
    if (url_params.has("emojis")) {
        emojis = base64_to_binary(url_params.get("emojis"));
    }
    for (let i = 0; i < emojis.length && i < all_emojis.length; i++) {
        if (emojis[i] == '1') {
            toggle_emoji(all_emojis[i]);
        }
    }
    update_q();
    if (selected_emojis.size == q**2 + q + 1) {
        create_cards();
    }
}

function set_url_params() {
    var emojis = "";
    for (let i = 0; i < all_emojis.length; i++) {
        emojis += selected_emojis.has(all_emojis[i]) ? '1' : '0';
    }
    emojis = binary_to_base64(emojis);

    const url_with_params = new URL(window.location.href);
    url_with_params.searchParams.delete('q');
    url_with_params.searchParams.append('q', q);
    url_with_params.searchParams.delete("emojis");
    url_with_params.searchParams.append("emojis", emojis);
    window.history.replaceState(null, null, url_with_params.href);
}

function update_q() {
    q = parseInt(document.getElementById("q-select").value);
    document.getElementById("plane-description").innerHTML =
        `Creating projective plane of order ${q}:\n` +
        `* ${q**2+q+1} points\n` +
        `* ${q**2+q+1} lines\n` +
        `* ${q+1} points per line`;
    update_cards_display();
}

let base64_encoding = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-"
// binary_encoding is a dictionary from base64 characters to 6-bit chunks,
// {'A': "000000", 'B': "100000", ...}
const base64_lookup = {};

function binary_to_base64(bin_string) {
    // For convenience assume this is little-endian, so padding the right
    // side of the binary string with zeros doesn't change its value
    bin_string = bin_string + '0'.repeat(mod(-bin_string.length, 6));
    var base64_string = "";
    // Iterate through 6-bit chunks
    for (let i = 0; i < bin_string.length; i += 6) {
        var char_value = 0;
        for (let j = 0; j < 6; j++) {
            char_value += parseInt(bin_string[i+j]) * 2**j;
        }
        base64_string += base64_encoding[char_value];
    }
    return base64_string;
}

function base64_to_binary(base64_string) {
    // First, create lookup table
    for (let c = 0; c < 64; c++) {
        var bin_string = "";
        for (let j = 0; j < 6; j++) {
            bin_string += (c % (2**(j+1)) >= (2**j)) ? '1' : '0';
        }
        base64_lookup[binary_to_base64(bin_string)] = bin_string;
    }
    // Iterate through each character in base64 string
    var bin_string = "";
    for (let i = 0; i < base64_string.length; i++) {
        bin_string += base64_lookup[base64_string[i]];
    }
    return bin_string;
}

function toggle_menu_visibility() {
    // Show or hide the emoji selection menu
    const button = document.getElementById("hide-menu-button");
    const emoji_menu = document.getElementById("emoji-menu");
    if (emoji_menu.style.display == "none") {
        emoji_menu.style.display = "block";
        button.innerHTML = "hide emoji selection menu";
    } else {
        emoji_menu.style.display = "none";
        button.innerHTML = "show emoji selection menu";
    }
}

function create_emoji_menu() {
    var menu_html = "";
    for (const category in emoji_categories) {
        menu_html += `<div><h3>${category} ` +
                     `(<a onclick="toggle_category('${category}')">` +
                     `select all` + 
                     `</a>):</h3></div><div>`
        for (let i = 0; i < emoji_categories[category].length; i++) {
            const sym = emoji_categories[category][i];
            menu_html += `<button id="${sym}" class="emoji-button" onclick="toggle_emoji('${sym}')">${sym}</button>`;
        }
        menu_html += "</div>";
    }
    document.getElementById("emoji-menu").innerHTML = menu_html;
}

function toggle_emoji(symbol) {
    // Adds or removes symbol from the set of selected emojis
    const button = document.getElementById(symbol);
    if (selected_emojis.has(symbol)) {
        selected_emojis.delete(symbol);
        button.classList.remove("emoji-button-selected");
    } else {
        selected_emojis.add(symbol);
        button.classList.add("emoji-button-selected");
    }
    update_cards_display();
}


function toggle_category(category) {
    // Adds all symbols in some category, or removes them all if they are all already added
    var all_selected = true;
    for (let i = 0; i < emoji_categories[category].length; i++) {
        if (!selected_emojis.has(emoji_categories[category][i])) {
            all_selected = false;
            break;
        }
    }
    for (let i = 0; i < emoji_categories[category].length; i++) {
        const symbol = emoji_categories[category][i];
        if (all_selected === selected_emojis.has(symbol)) {
            toggle_emoji(symbol);
        }
    }
}

function update_cards_display() {
    document.getElementById("cards").innerHTML = `${selected_emojis.size}/${q**2+q+1} emojis selected`;
    document.getElementById("copy-cards").style.display = "none";
}

function copy_cards() {
    let text = document.getElementById("cards").innerHTML;
    navigator.clipboard.writeText(text);
}


function create_cards() {
    update_q();
    var plane = new ProjectivePlane(q);
    let num_symbols = plane.V;

    var emojis_to_toggle = [];
    if (selected_emojis.size < num_symbols) {
        var message =
            `You need ${num_symbols} symbols, but have only selected ${selected_emojis.size}.` +
            `\n\nDo you want to select ${num_symbols - selected_emojis.size} more at random?`;
        if (!confirm(message)) {
            return;
        }
        // Select more symbols at random
        emojis_to_toggle = shuffle([...(new Set(all_emojis)).difference(selected_emojis)]).slice(0, num_symbols - selected_emojis.size);
    } else if (selected_emojis.size > num_symbols) {
        var message =
            `You need ${num_symbols} symbols, but have ${selected_emojis.size} selected.` +
            `\n\nDo you want to randomly deselect ${selected_emojis.size - num_symbols} of those?`;
        if (!confirm(message)) {
            return;
        }
        // Deselect symbols at random
        emojis_to_toggle = shuffle([...selected_emojis]).slice(0, selected_emojis.size - num_symbols);
    }
    for (let i = 0; i < emojis_to_toggle.length; i++) {
        toggle_emoji(emojis_to_toggle[i]);
    }
    let emoji_list = shuffle([...selected_emojis]);
    set_url_params();

    var text = "";
    // Iterate through vertices on each line
    let lines = shuffle(plane.lines);
    for (let i = 0; i < lines.length; i++) {
        let line = shuffle(lines[i]);
        for (let j = 0; j < line.length; j++) {
            if (j > 0) {
                text += ' ';
            }
            let vertex = line[j];
            text += emoji_list[vertex];
        }
        text += '\n';
    }
    document.getElementById("cards").innerHTML = text;
    document.getElementById("copy-cards").style.display = "block";
}
