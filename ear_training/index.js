"use strict"

var total_correct = 0;
var total_incorrect = 0;
var available_notes = []
var available_notes_mod12 = new Set();
var current_note = -1;

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

window.addEventListener("load", update_html, false);
function update_html() {
    total_correct = 0;
    total_incorrect = 0;
    document.getElementById("game-status").innerHTML = "<p>Your score: " +
        "<strong><span style=\"color:#880\">0/0 = 50%</span></strong><br>" +
        "Click the button above to play a random note, then guess which note it is.</p>";

    let notation = parseInt(document.getElementById("notation").value);
    let root     = parseInt(document.getElementById("root"    ).value);
    let scale    = parseInt(document.getElementById("scale"   ).value);
    let lowest   = parseInt(document.getElementById("lowest"  ).value);
    let highest  = parseInt(document.getElementById("highest" ).value);

    // In case scale type has changed, expand range to ensure that the
    // lowest and highest notes are still part of the scale
    while (!is_valid_note(lowest, root, scale)) {
        lowest--;
        if (lowest < 0) {
            lowest = root;
        }
    }
    while (!is_valid_note(highest, root, scale)) {
        highest++;
        if (highest >= 88) {
            highest -= 12;
        }
    }

    // First, rename the options for root, lowest note, and highest note according to notation type
    assert(lowest <= highest);
    // Dropdown menu for ROOT
    let html = "";
    for (let i = 0; i < 12; i++) {
        html += "<option value=" + i.toString();
        if (i == root) {
            html += " selected=\"selected\"";
        }
        html += ">" + note_name(i, notation).slice(0, -1) + "</option>";
    }
    document.getElementById("root").innerHTML = html;
    // Dropdown menu for LOWEST
    html = "";
    for (let i = 0; i <= highest; i++) {
        if (!is_valid_note(i, root, scale)) {
            continue;
        }
        html += "<option value=" + i.toString();
        if (i == lowest) {
            html += " selected=\"selected\"";
        }
        html += ">" + note_name(i, notation) + "</option>";
    }
    document.getElementById("lowest").innerHTML = html;
    // Dropdown menu for HIGHEST
    html = "";
    for (let i = lowest; i < 88; i++) {
        if (!is_valid_note(i, root, scale)) {
            continue;
        }
        html += "<option value=" + i.toString();
        if (i == highest) {
            html += " selected=\"selected\"";
        }
        html += ">" + note_name(i, notation) + "</option>";
    }
    document.getElementById("highest").innerHTML = html;

    // Find list of available notes
    available_notes = [];
    for (let i = lowest; i <= highest; i++) {
        if (is_valid_note(i, root, scale)) {
            available_notes.push(i);
        }
    }

    // CREATE THE KEYBOARD
    html = "";
    if (document.getElementById("octave-equivalence").value == 0) {
        // Create keyboard for only one octave
        available_notes_mod12 = new Set();
        for (let i = 0; i < available_notes.length; i++) {
            let note = available_notes[i] % 12;
            if (note < root) {
                available_notes_mod12.add(note + 12);
            } else {
                available_notes_mod12.add(note);
            }
        }
        available_notes_mod12 = Array.from(available_notes_mod12);
        available_notes_mod12.sort(function(a, b) { return a - b; });
        for (let i = 0; i < available_notes_mod12.length; i++) {
            let note = available_notes_mod12[i];
            if (is_white(note)) {
                html += "<button class=\"white-key\" ";
            } else {
                html += "<button class=\"black-key\" ";
            }
            html += "onclick=\"click_note(" + note.toString() + ")\">";
            html += note_name(note, notation).slice(0, -1) + "</button>";
        }
        html += "<br><br>";
    } else {
        // Create keyboard for multiple octaves
        // In addition to the lowest and highest notes which are visible, there are more
        // notes that are hidden, because each row needs 12 notes to make the columns
        // of visible notes line up. lowest_note and highest_note are the actual lowest
        // and highest notes that there is a key for
        let lowest_note = lowest;
        while ((lowest_note - root) % 12 != 0) {
            lowest_note--;
        }
        let highest_note = highest;
        while ((lowest_note - root) % 12 != 0) {
            highest_note++;
        }
        for (let octave = 0; octave <= (highest_note - lowest_note) / 12; octave++) {
            html += "<div style=\"display: flex; width: 100%; justify-content: space-between; overflow: auto\">";
            let start_note = lowest_note + octave * 12;
            for (let i = start_note; i < 12 + start_note; i++) {
                if (is_white(i)) {
                    html += "<button class=\"white-key\" ";
                } else {
                    html += "<button class=\"black-key\" ";
                }
                if (is_valid_note(i, root, scale) && lowest <= i && i <= highest) {
                    html += "onclick=\"click_note(" + i.toString() + ")\">";
                    html += note_name(i, notation);
                } else {
                    html += "style=\"visibility: hidden;\">";
                }
                html += "</button>";
            }
            html += "</div>";
        }
    }
    document.getElementById("keyboard").innerHTML = html;
}

function is_valid_note(number, root, scale_type) {
    if (!(Number.isInteger(number)) || number < 0 || number >= 88) {
        return false;
    }
    assert(Number.isInteger(root) && 0 <= root && root < 12);

    number -= root;
    // Add 12 here, because a negative number modulo 12 would be negative:
    number = (number + 12) % 12;

         if (scale_type == 0) { return number == 0;                             } // Just Do
    else if (scale_type == 1) { return [0,          7       ].includes(number); } // Do/Sol
    else if (scale_type == 2) { return [0,    4,    7       ].includes(number); } // Do/Mi/Sol
    else if (scale_type == 3) { return [0, 2, 4,    7, 9    ].includes(number); } // Pentatonic
    else if (scale_type == 4) { return [0, 2, 4, 5, 7, 9, 11].includes(number); } // Major
    else if (scale_type == 5) { return [0, 2, 3, 5, 7, 8, 10].includes(number); } // Minor
    else if (scale_type == 6) { return true;                                    } // Chromatic
    else                      { throw "Error"; }
}

function is_white(number) {
    // A key is white iff it is in the C major (aka A minor) scale
    return is_valid_note(number, 3, 4);
}

function note_name(number, notation_type) {
    // Assert the note is one of the 88 keys on the piano (which are all in the chromatic scale)
    assert(is_valid_note(number, 0, 6));
    const octave = Math.floor((number + 9) / 12);
    number %= 12;
    let name = "";
    if (notation_type == 0) {
        name = ["A", "A♯", "B", "C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯"][number];
    } else if (notation_type == 1) {
        name = ["A", "B♭", "B", "C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭"][number];
    } else if (notation_type == 2) {
        name = ["A", "AB", "B", "C", "CD", "D", "DE", "E", "F", "FG", "G", "GA"][number];
    } else if (notation_type == 3) {
        name = ["A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab"][number];
    } else {
        throw "Error";
    }
    name += octave.toString();
    if (notation_type == 3) {
        name += ".mp3";
    }
    return name;
}

var note_audios = [];
for (let i = 0; i < 88; i++) {
    let filename = "notes/" + note_name(i, 3);
    note_audios.push(new Audio(filename));
}
function play_note(number) {
    note_audios[number].play();
}
function play_rand() {
    let octave_equivalency = (document.getElementById("octave-equivalence").value == 0);
    if (available_notes.length == 1 || (octave_equivalency && available_notes_mod12.length == 1)) {
        alert("This is too easy, how about a challenge? " +
            "Change the settings so that you have multiple guesses to choose from.");
        return;
    }
    if (current_note == -1) {
        // Choose a different random note now
        const randomIndex = Math.floor(Math.random() * available_notes.length);
        current_note = available_notes[randomIndex];
    }
    play_note(current_note);
}


function click_note(number) {
    if (current_note == -1) {
        return;
    }
    let notation = parseInt(document.getElementById("notation").value);
    let octave_equivalency = (document.getElementById("octave-equivalence").value == 0);
    let correct = (number == current_note);
    if (octave_equivalency && (number - current_note) % 12 == 0) {
        correct = true;
    }
    if (correct) {
        total_correct++;
    } else {
        total_incorrect++;
    }

    let score = total_correct / (total_correct + total_incorrect);
    let score_rgb = "rgb(" + Math.floor(256 * (1 - score)).toString() + "," + Math.floor(256 * score).toString() + ",0)";
    let html = "<p>Your score: <strong><span style=\"color: " + score_rgb + "\">";
    html += total_correct.toString() + "/" + (total_correct + total_incorrect).toString() + " = ";
    html += (100 * score).toPrecision(3) + "%</span></strong><br>";
    if (correct) {
        html += "<strong><span style=\"color: #0f0\">Correct!</span></strong>";
        html += " The note was <strong><span style=\"color: #0f0\">" + note_name(current_note, notation) + "</span></strong>.";
        html += "<br>Click the button above to guess another note.";
    } else {
        let guess = note_name(number, notation);
        if (octave_equivalency) {
            guess = guess.slice(0, -1);
        }
        html += "You guessed <strong><span style=\"color: #f00\">" + guess;
        html += "</span></strong>, but the note was actually <strong>" + note_name(current_note, notation) + "</strong>";
        html += "<br>Click the button above to try again.";
    }
    html += "</p>";
    document.getElementById("game-status").innerHTML = html;

    current_note = -1;
}
