#!/usr/bin/env python3
from tools_for_rendering_frames import *

run('g++ create_image.cpp -lGLESv2 -lglfw')
print('Done compiling')

num_frames = 500
for i in range(num_frames + 1):
    bleh = i / num_frames
    crosshair_x = (.37416) * bleh + (.3766) * (1 - bleh)
    crosshair_y = (-.22887) * bleh + (-.22835) * (1 - bleh)
    command = f'./a.out -fractal-type 1 -coloring-method 2 -max-iterations 200 -divergence-threshold 1000000 -colorscheme 0 -colorfulness 40 -color-offset .75 -julify -scale-factor 100 -center-x .323 -center-y -.21 -crosshair-x {crosshair_x} -crosshair-y {crosshair_y} -heartiness .6 -rotation-degrees 0'
    run(command)
    run(f'convert frame.png -resize 1920x1080 clip1/frame{i}.png')
    print(f'Created clip1/frame{i}.png')

run('ffmpeg -r 60 -f image2 -s 1920x1080 -i clip1/frame%d.png -vcodec libx264 -pix_fmt yuv420p clip1.mp4')
print('Done!')
