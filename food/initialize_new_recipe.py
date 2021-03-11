#!/usr/local/bin/python3
import os

food = input('What is the name of the new food?\n')
directory_name = food.replace(' ', '_')
os.mkdir(f'recipes/{directory_name}')
with open(f'recipes/{directory_name}/index.md', 'w+') as file:
    file.write('---\n' +
               'layout: default\n' +
               '---\n' +
              f'# {food}\n')
os.system(f'nvim recipes/{directory_name}/index.md')
