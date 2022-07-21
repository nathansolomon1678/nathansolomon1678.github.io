#!/usr/bin/env python3
import json
import os
import re

recipe_names = sorted([recipe for recipe in os.listdir('.') if os.path.isdir(recipe)])
if '_site' in recipe_names: recipe_names.remove('_site')
if '__pycache__' in recipe_names: recipe_names.remove('__pycache__')
for recipe_name in recipe_names:
    print(f'Reading {recipe_name}')
    human_readable_recipe_name = recipe_name.replace('_', ' ')
    with open(f'{recipe_name}/recipe.json') as file:
        recipe = json.load(file)
    source = recipe.get('Source')
    source_html = '' if source is None else f'\n<p><strong>Source:</strong> based on <a href={source}>{source}</a></p>'
    serving_size = recipe.get('Serving size')
    serving_size_html = '' if serving_size is None else f'\n<p><strong>Serving size:</strong> {serving_size}</p>'
    pictures = recipe.get('Pictures')
    pictures_html = ''
    if pictures is not None:
        for url, caption in pictures.items():
            pictures_html += f'\n<img src="{url}">\n<p><i>{caption}</i></p>'
    ingredients = recipe.get('Ingredients')
    if isinstance(ingredients, list):
        # Proceed normally, since it's just an ingredients list
        ingredients_html = '\n<hr><h2>Ingredients</h2>\n<ul>'
        for ingredient in ingredients:
            ingredients_html += f'\n<li>{ingredient}</li>'
        ingredients_html += '\n</ul>'
    elif isinstance(ingredients, dict):
        # This means the ingredients list is broken into subcategories
        ingredients_html = '\n<hr><h2>Ingredients</h2>'
        for subcategory, ingredient_list in ingredients.items():
            ingredients_html += f'\n<h3>{subcategory}</h3>\n<ul>'
            for ingredient in ingredient_list:
                ingredients_html += f'\n<li>{ingredient}</li>'
            ingredients_html += '\n</ul>'
    instructions = recipe.get('Instructions')
    instructions_html = '' if instructions is None else f'\n<hr><h2>Instructions</h2>\n<p>{instructions}</p>'
    serving_suggestion = recipe.get('Serving suggestion')
    serving_suggestion_html = '' if serving_suggestion is None else f'\n<hr><h2>Serving suggestion</h2>\n<p>{serving_suggestion}</p>'

    html = f"""<!Doctype HTML>
<html>
    <head>
        <link rel="stylesheet" href="../recipe.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta charset="utf-8"/>
        <meta name="author" content="Nathan Solomon">
        <title>{human_readable_recipe_name}</title>
    </head>
    <!-- The following HTML is taken from https://morotsman.github.io/blog,/google/analytics,/jekyll,/github/pages/2020/07/07/add-google-analytics.html -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-206139197-1"></script>
    <script>
    	window.dataLayer = window.dataLayer || [];
    	function gtag(){{dataLayer.push(arguments);}}
    	gtag('js', new Date());
    
    	gtag('config', 'UA-206139197-1');
    </script>
    <body>
        <div id="main">
            <h1>{human_readable_recipe_name}</h1><hr>
            {source_html}
            {serving_size_html}
            {pictures_html}
            {ingredients_html}
            {instructions_html}
            {serving_suggestion_html}
        </div>
    </body>
</html>
"""
    with open(f'{recipe_name}/index.html', 'w+') as file:
        file.write(html)


recipe_names = sorted([recipe for recipe in os.listdir('.') if os.path.isdir(recipe)])
if '_site'       in recipe_names: recipe_names.remove('_site')
if '__pycache__' in recipe_names: recipe_names.remove('__pycache__')

with open('index.html') as file:
    html_file_contents = file.read()

recipe_list_html = '<div id="recipe-list">'
for recipe in recipe_names:
    human_readable_recipe_name = recipe.replace('_', ' ')
    recipe_list_html += f'\n<a href="{recipe}"><div class="recipe-button"><p>{human_readable_recipe_name}</p></div></a>'
recipe_list_html += '\n            </div>'
recipe_list_html += '\n        </div>'
recipe_list_html += '\n    </body>'
recipe_list_html += '\n</html>'

regex = re.compile('<div id=\"recipe-list\">.*', re.DOTALL)
html_file_contents = re.sub(regex, recipe_list_html, html_file_contents)
with open('index.html', 'w') as file:
    file.write(html_file_contents)

print("Done updating HTML")
