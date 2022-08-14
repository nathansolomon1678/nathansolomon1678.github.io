import subprocess
import math

def run(command):
    subprocess.call(command.split())

def interpolate(values, proportion):
    value1 = values[math.floor(proportion * (len(values) - 1))]
    value2 = values[math.ceil(proportion * (len(values) - 1))]
    proportion = (proportion * (len(values) - 1)) % 1
    return value2 * proportion + value1 * (1 - proportion)
