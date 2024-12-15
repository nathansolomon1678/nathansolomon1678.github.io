#!/usr/bin/env python3
import random

# Let p be some prime number. It is the "order" of the
# finite affine plane to be generated
# TODO: generalize this code to work when p is a prime power
# (see list of prime powers from https://oeis.org/A000961)
p = 7
# Let c be the number of cards
c = 100
assert p in [1, 2, 3, 5, 7, 11]
c = min(c, p**2)
print(f"Generating {p**2} cards using {p**2+p} symbols.")
print(f"Each card has {p+1} symbols, and each symbol appears on {p} cards.")
if c < p**2:
    print(f"Omitting {p**2-c} of those cards, because you only wanted {c} cards.")
print('\n')

cards = [set() for i in range(p**2)]

symbols = [str(i) for i in range(p**2 + p)]
# I chose out 56 fun symbols, which is just enough for when p=7
fun_symbols = "🐒🐼🐧🦆🦉🦃🐢🐬🦀🦐🦑🦋🐌🦂🍇🍉🍋🍌🍍🍓🥝🥑🌽🥐🥞🧀🍔🍟🍕🌭🌮🍩" + \
"⚽⚾🏀🏐🎱🎳🎲🎷🎸🎻🔬🕯📜💰🗝🔮🤡👻👽💩💪🖖👋🛒"
for i in range(min(len(fun_symbols), p**2 + p)):
    symbols[p**2 + p - i - 1] = fun_symbols[i]

# Arrange the cards in a p by p grid, then draw a bunch of horizontal lines
# through them. For each line, add a unique symbol to each card the line
# passes through. i is the row number, and k is the column number
for i in range(p):
    for k in range(p):
        cards[i * p + k].add(symbols[i + p**2])
# Now on the same grid, draw a bunch of diagonal lines. Each line is
# determined by i and j, and we then add the corresponding symbol to the
# kth element of that line, for k in range(p)
# the slope of the line is -1/i and the horizontal offset of the line is j
for i in range(p):
    for j in range(p):
        for k in range(p):
            cards[p * k + (j + i * k) % p].add(symbols[i * p + j])

# This next step really isn't necessary, because we know by design that
# each pair of cards should have exactly one symbol in common
for i in range(c):
     for j in range(i+1, c):
         if len(cards[i].intersection(cards[j])) != 1:
             print(cards[i])
             print(cards[j])
             raise Exception(f"Intersection of cards is {cards[i].intersection(cards[j])}")

random.shuffle(cards)
cards = cards[:c]
for card in cards:
    card = list(card)
    random.shuffle(card)
    print(' '.join(card))
