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
with open('index.md') as file:
    readme_file_contents = file.read().split('## Recipe list')[0] + '## Recipe list'
recipe_names = sorted([recipe for recipe in os.listdir('.') if os.path.isdir(recipe)])
if '_site' in recipe_names: recipe_names.remove('_site')
for recipe in recipe_names:
    human_readable_recipe_name = recipe.replace('_', ' ')
    readme_file_contents += f'\n[{human_readable_recipe_name}]({recipe}){{: .btn}}\n'
with open('index.md', 'w') as file:
    file.write(readme_file_contents)

import update_html
