#!/usr/bin/env python3
from tools_for_rendering_frames import *

run('g++ create_image.cpp -lGLESv2 -lglfw')
print('Done compiling')

num_frames = 400
for i in range(num_frames + 1):
    bleh = i / num_frames
    crosshair_x = (0.38137) * bleh + (0.38215) * (1 - bleh)
    crosshair_y = (-0.24996) * bleh + (-0.25052) * (1 - bleh)
    command = f'./a.out -fractal-type 1 -coloring-method 3 -max-iterations 400 -divergence-threshold -1 -colorscheme 2 -colorfulness 2000 -color-offset 0 -julify -scale-factor 500 -center-x .382 -center-y -.245 -crosshair-x {crosshair_x} -crosshair-y {crosshair_y} -heartiness 0 -rotation-degrees 0'
    run(command)
    run(f'convert frame.png -resize 1920x1080 clip2/frame{i}.png')
    print(f'Created clip1/frame{i}.png')

run('ffmpeg -r 60 -f image2 -s 1920x1080 -i clip2/frame%d.png -vcodec libx264 -pix_fmt yuv420p clip2.mp4')
print('Done!')
