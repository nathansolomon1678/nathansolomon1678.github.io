"use strict"

// Dictionary from prime powers, q=p^n, to the tuple (p,n)
const prime_powers = {
    2:  ( 2, 1),
    3:  ( 3, 1),
    4:  ( 2, 2),
    5:  ( 5, 1),
    7:  ( 7, 1),
    8:  ( 2, 3),
    9:  ( 3, 2),
    11: (11, 1),
    13: (13, 1),
    16: ( 2, 4),
    17: (17, 1),
    19: (19, 1)
}

// Default values:
var s = 8;  // s = number of symbols per card
var q = 7;  // q = p^n is a prime power, denoting the order of the finite field F
var p = 7;
var n = 1;

function update_range_slider() {
    s = parseInt(document.getElementById("s").value);
    if (s - 1 in prime_powers) {
        q = s - 1;
        console.log("Creating projective plane of order " + q);
    } else if (s in prime_powers) {
        q = s;
        console.log("Creating affine plane of order " + q);
    } else if (s == 15) {
        document.getElementById("s").value = 14;
        s = 14;
        alert("The number of symbols per card can be any integer between 2 and 20, except for 15. " +
              "That's because 15 is neither a prime power, nor one more than a prime power." +
              "\n\nLet's try using 14 symbols per card instead.");
    } else {
        alert("Error: s must be an integer between 2 and 20, not " + s);
    }
    p = prime_powers[q][0];
    n = prime_powers[q][1];
    document.getElementById("range slider label").innerHTML = "<strong>Number of symbols per card: " + s + "</strong>";
}

window.addEventListener("load", create_cards, false);
function create_cards() {
    update_range_slider();
}
