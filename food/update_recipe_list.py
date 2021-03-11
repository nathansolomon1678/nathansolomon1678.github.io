#!/usr/local/bin/python3
import os

with open('index.md') as file:
    file_contents = file.read().split('## Recipe list')[0] + '## Recipe list'
for recipe_name in sorted(os.listdir('recipes')):
    recipe_name = recipe_name.split('.md')[0]
    human_readable_recipe_name = recipe_name.replace('_', ' ')
    file_contents += f'\n[`{human_readable_recipe_name}`](recipes/{recipe_name})\n'
with open('index.md', 'w') as file:
    file.write(file_contents)
