#!/usr/bin/env python3
import os

food = input('What is the name of the new food?\n')
directory_name = food.replace(' ', '_')
os.mkdir(directory_name)
with open(f'{directory_name}/recipe.json', 'w+') as file:
    file.write("""
{
    "Source": "",
    "Serving size": "",
    "Pictures": {
    },
    "Ingredients": [
    ],
    "Instructions": "",
    "Serving suggestion": ""
}""")
os.system(f'nvim {directory_name}/recipe.json')

# After closing the file, update the recipe list
import update_html
