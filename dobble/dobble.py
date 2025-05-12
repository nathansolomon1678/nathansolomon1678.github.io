#!/usr/bin/env python3

from projective_plane import *

# When editing this file in Vim, be sure to use "set noemoji" for the emojis to
# display in a way that's not horribly disgusting

# For counting purposes, there's ten emojis per line. TODO: Ideally I want 381
# different emojis in total which would be just enough for 20 emojis per card
emojis = {
    "animals": [
        '🐒', '🐼', '🐧', '🦆', '🦉', '🦃', '🐢', '🐬', '🦀', '🦐',
        '🦑', '🦋', '🐌', '🦂'
    ],
    "foods": [
        '🍇', '🍉', '🍋', '🍌', '🍍', '🍓',
        '🥝', '🥑', '🌽', '🥐', '🥞', '🧀', '🍔', '🍟', '🍕', '🌭',
        '🌮', '🍩'
    ],
    "objects": [
        '⚽', '⚾', '🏀', '🏐', '🎱', '🎳', '🎲', '🎷',
        '🎸', '🎻', '🔬', '🕯', '📜', '💰', '🗝', '🔮'
    ],
    "misc": [
        '🤡', '👻',
        '👽', '💩', '💪', '🖖', '👋', '🛒', '🤓', '🤯', '🥀', '🕴️',
        '🧬', '🫀', '🪔'
    ],
    "stuff": [
        '🪐', '🥧', '🥨', '🦓', '🦚', '🍆','💀',
        '🌈', '♈️', '♉️', '♊️', '♋️', '♌️', '♍️', '♎️', '♏️', '♐️',
        '♑️', '♒️', '♓️', '♠️', '♣️', '♥️', '♦️', '♻️', '☔️', '✨️',
        '🐓', '🐞', '🐲', '👀', '💎', '🐐', '🚦', '🦩', '🦨', '🥪',
        '🧸', '🧠', '🧊', '🧋', '🧇', '🧄', '🦦', '🦥', '🦣', '🦢',
        '🥥', '🧅', '🧲', '🪗', '🗞️', '🕋'
    ],
    "letters": [
        'ℵ', 'ඞ', 'ℝ',
    ],
    "flags": [
    ]
}

symbols = emojis["animals"] + emojis["foods"] + emojis["letters"] + emojis["stuff"]
symbols.sort()
print(f"Here are the {len(symbols)} symbols to choose from:")
for i in range(len(symbols) // 10):
    print('\t'.join(symbols[i*10:i*10+10]))
print('\t'.join(symbols[len(symbols) - len(symbols)%10:]))

q = 0
while q not in prime_powers:
    q = int(input(f"\nHow many symbols do you want per card?\n")) - 1
    if q not in prime_powers:
        print(f"\nSorry, you must choose one of the following integers:\n{[x + 1 for x in sorted(prime_powers.keys())]}")

c = 0
while c < 2 or c > q**2+q+1:
    c = int(input(f"\nHow many cards do you want to create? You can make up to {q**2+q+1}.\n"))
    if c < 2:
        print("\nYou should have at least 2 cards, or else there won't be any matches to spot!")
    elif c > q**2+q+1:
        print(f"\nThere aren't enough symbols per card to make {c} cards. Best we can do is {q**2+q+1}.")
        c = q**2+q+1

all_symbols = set()
for sym in symbols:
    if sym in all_symbols:
        raise Exception(f"Repeat emoji: {sym} (unicode value {ord(sym)})")
    all_symbols.add(sym)


print("\nCreating deck... (this could take a minute)\n")
cards = ProjectivePlane(q).create_cards(symbols = all_symbols)

random.shuffle(cards)
cards = cards[:c]
for card in cards:
    card = list(card)
    random.shuffle(card)
    print(' '.join(card))

print("""
To print this, copy & paste the emojis above into a Google Doc, configure the page
setup to be landscape mode, center all text, and increase font size until each
line takes up exactly one page. Then print to PDF with either 4 or 6 pages per sheet.

Note that you can remove as many cards as you want and the game will still work. So
if the last page of your PDF only has 1 or 2 cards, you can save paper by just
not printing that last page.
""")
