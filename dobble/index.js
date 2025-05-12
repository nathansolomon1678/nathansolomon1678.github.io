"use strict"

// DEFAULT VALUES
var s = 8;  // s = number of symbols per card (either s=q or s=q+1)
var q = 7;  // q = p^n is a prime power, denoting the order of the finite field F
var p = 7;
var n = 1;
var F = new FiniteField(q);
var selected_emojis = new Set();

function update_s_number() {
    const number_input = document.getElementById("s-number");
    if (number_input.value == 15) {
        s = (s < 15) ? 16 : 14;
    } else {
        s = number_input.value;
    }
    document.getElementById("s-slider").value = s;
    update_s_slider();
}

function update_s_slider() {
    s = parseInt(document.getElementById("s-slider").value);
    // If s and s-1 are both prime powers, default to using a projective plane
    // instead of an affine plane. That's because projective planes are slightly
    // more elegant (they are their own dual). Alternatively, choosing to create
    // an affine plane would allow you to create more cards, which would be nice:
    // that would give you q^2=s^2 cards instead of q^2+q+1=s^2-s+1 cards.
    // TODO: if s and s-1 are both prime powers, prompt user for how many symbols
    // or how many cards they want
    // TODO: discuss construction of Steiner systems S(2,k,n) other than just
    // projective and affine planes
    if (s - 1 in prime_powers) {
        q = s - 1;
        console.log("Creating projective plane of order " + q);
    } else if (s in prime_powers) {
        q = s;
        console.log("Creating affine plane of order " + q);
    } else if (s == 15) {
        document.getElementById("s-slider").value = 14;
        s = 14;
        alert("The number of symbols per card can be any integer between 2 and 20, except for 15. " +
              "That's because 15 is neither a prime power, nor one more than a prime power." +
              "\n\nLet's try using 14 symbols per card instead.");
    } else {
        alert("Error: s must be an integer between 2 and 20, not " + s);
    }
    p = prime_powers[q][0];
    n = prime_powers[q][1];
    document.getElementById("s-number").value = s;
    F = new FiniteField(q);
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
    for (const category in all_symbols) {
        menu_html += `<div><h3>${category}:` +
                     `<button onclick="toggle_category('${category}')" style="float: right">` +
                     `select all ${category.toUpperCase()}` + 
                     `</button></h3></div><div>`
        for (const i in all_symbols[category]) {
            const sym = all_symbols[category][i];
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
}


function toggle_category(category) {
    // Adds all symbols in some category, or removes them all if they are all already added
    var all_selected = true;
    for (const i in all_symbols[category]) {
        if (!selected_emojis.has(all_symbols[category][i])) {
            all_selected = false;
            break;
        }
    }
    for (const i in all_symbols[category]) {
        const symbol = all_symbols[category][i];
        if (all_selected === selected_emojis.has(symbol)) {
            toggle_emoji(symbol);
        }
    }
}



window.addEventListener("load", create_cards, false);
function create_cards() {
    update_s_slider();
    // TODO: save values s, q, the random seed, and the seleted emojis in the URL
}
