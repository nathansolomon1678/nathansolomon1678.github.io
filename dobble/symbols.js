"use strict"

const emoji_categories = {
    "Astrology": [
        '♈️', '♉️', '♊️', '♋️', '♌️', '♍️', '♎️', '♏️', '♐️', '♑️',
        '♒️', '♓️'
    ],
    "Food": [
        '🍇', '🍉', '🍋', '🍌', '🍍', '🍓',
        '🥝', '🥑', '🌽', '🥐', '🥞', '🧀', '🍔', '🍟', '🍕', '🌭',
        '🌮', '🍩'
    ],
    "Animals": [
        '🐒', '🐼', '🐧', '🦆', '🦉', '🦃', '🐢', '🐬', '🦀', '🦐',
        '🦑', '🦋', '🐌', '🦂'
    ]
}

const all_emojis = [];
for (const category in emoji_categories) {
    all_emojis.push(... emoji_categories[category]);
}
