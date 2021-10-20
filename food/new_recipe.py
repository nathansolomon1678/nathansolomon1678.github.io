#!/usr/bin/env python3
import os
import re

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
with open('index.html') as file:
    html_file_contents = file.read()
recipe_names = sorted([recipe for recipe in os.listdir('.') if os.path.isdir(recipe)])
if '_site' in recipe_names: recipe_names.remove('_site')
if '__pycache__' in recipe_names: recipe_names.remove('__pycache__')

recipe_list_html = '<ul id="recipe-list">'
for recipe in recipe_names:
    human_readable_recipe_name = recipe.replace('_', ' ')
    recipe_list_html += f'\n                <li><a href={recipe}>{human_readable_recipe_name}</a></li>'
recipe_list_html += '\n            </ul>'
regex = re.compile('<ul id="recipe-list">.*</ul>', re.DOTALL)
html_file_contents = re.sub(regex, recipe_list_html, html_file_contents)
with open('index.html', 'w') as file:
    file.write(html_file_contents)

import update_html
