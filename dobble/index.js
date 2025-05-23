"use strict"

// DEFAULT VALUES
var q = 7;
var selected_emojis = new Set();

function shuffle(arr) {
    // Returns a given array in a random order
    return arr.sort(() => Math.random() - 0.5);
}


window.addEventListener("load", update_q, false);
function update_q() {
    q = parseInt(document.getElementById("q-select").value);
    // TODO: discuss construction of Steiner systems S(2,k,n) other than just
    // projective and affine planes
    document.getElementById("settings-description").innerHTML =
        `Creating projective plane of order ${q}:<br>` +
        `* ${q+1} symbols per card<br>` +
        `* ${q**2+q+1} symbols<br>` +
        `* Up to ${q**2+q+1} cards`;
    update_cards_display();
}

function toggle_menu_visibility() {
    // Show or hide the emoji selection menu
    const button = document.getElementById("hide-menu-button");
    const emoji_menu = document.getElementById("emoji-menu");
    if (emoji_menu.style.display == "none") {
        emoji_menu.style.display = "block";
        button.innerHTML = "Hide emoji selection menu";
    } else {
        emoji_menu.style.display = "none";
        button.innerHTML = "Show emoji selection menu";
    }
}

window.addEventListener("load", create_emoji_menu, false);
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
    let text = document.getElementById("cards").innerHTML.replaceAll("<br>", '\n');
    navigator.clipboard.writeText(text);
}


function create_cards() {
    update_q();
    // TODO: save q, the random seed, and the selected emojis in the URL
    var plane = new ProjectivePlane(q);
    let num_symbols = plane.V;
    let emoji_list = shuffle([...selected_emojis]);
    if (emoji_list.length < num_symbols) {
        var message =
            `You need ${num_symbols} symbols, but have only selected ${emoji_list.length}.` +
            `\n\nDo you want to select ${num_symbols - emoji_list.length} more at random?`;
        if (!confirm(message)) {
            return;
        }
        // TODO: select more symbols at random
    } else if (emoji_list.length > num_symbols) {
        var message =
            `You need ${num_symbols} symbols, but have ${emoji_list.length} selected.` +
            `\n\nDo you want to randomly deselect ${emoji_list.length - num_symbols} of those?`;
        if (!confirm(message)) {
            return;
        }
        // TODO: deselect symbols at random
    }
    var text = "";
    // Iterate through vertices on each line
    let lines = shuffle(plane.lines);
    for (let line = 0; line < lines.length; line++) {
        for (let v = 0; v < lines[line].length; v++) {
            if (v > 0) {
                text += ' ';
            }
            let vertex = lines[line][v];
            text += emoji_list[vertex];
        }
        text += "<br>";
    }
    document.getElementById("cards").innerHTML = text;
    document.getElementById("copy-cards").style.display = "block";
}
