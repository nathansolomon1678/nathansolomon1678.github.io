#!/usr/bin/env python3
from tools_for_rendering_frames import *

run('g++ create_image.cpp -lGLESv2 -lglfw')
print('Done compiling')

num_frames = 1000
for i in range(num_frames + 1):
    bleh = i / num_frames
    crosshair_x = interpolate([-.46553, -.44919, -.44245], bleh)
    crosshair_y = interpolate([.63896, .65140, .66183], bleh)
    scale_factor = 2 * 100 ** bleh
    rotation_degrees = bleh * 100
    command = f'./a.out -fractal-type 1 -coloring-method 2 -max-iterations 150 -divergence-threshold 1 -colorscheme 0 -colorfulness 100 -color-offset 0 -julify -scale-factor {scale_factor} -center-x -.40806 -center-y .36369 -crosshair-x {crosshair_x} -crosshair-y {crosshair_y} -heartiness 0 -rotation-degrees {rotation_degrees}'
    run(command)
    run(f'convert frame.png -resize 1920x1080 clip3/frame{i}.png')
    print(f'Created clip1/frame{i}.png')

run('ffmpeg -r 60 -f image2 -s 1920x1080 -i clip3/frame%d.png -vcodec libx264 -pix_fmt yuv420p clip3.mp4')
run('rm frame.png')
print('Done!')
