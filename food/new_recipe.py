#!/usr/local/bin/python3
import os

food = input('What is the name of the new food?\n')
directory_name = food.replace(' ', '_')
os.mkdir(f'recipes/{directory_name}')
with open(f'recipes/{directory_name}/index.md', 'w+') as file:
    file.write('---\n' +
               'layout: default\n' +
               '---\n' +
              f'# {food}\n' +
               '## Ingredients')
os.system(f'nvim recipes/{directory_name}/index.md')

# After closing the file, update the recipe list
with open('index.md') as file:
    file_contents = file.read().split('## Recipe list')[0] + '## Recipe list'
for recipe_name in sorted(os.listdir('recipes')):
    recipe_name = recipe_name.split('.md')[0]
    human_readable_recipe_name = recipe_name.replace('_', ' ')
    file_contents += f'\n[{human_readable_recipe_name}](recipes/{recipe_name}){{: .btn}}\n'
with open('index.md', 'w') as file:
    file.write(file_contents)
