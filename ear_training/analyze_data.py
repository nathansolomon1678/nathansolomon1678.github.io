#!/usr/bin/env python3
import math
from pydub import AudioSegment
import scipy.io.wavfile as wavfile
from scipy.fft import fft, fftfreq
import numpy as np
import matplotlib.pyplot as plt


def mp3_signal(filename):
    assert filename[-4:] == ".mp3"
    converted_filename = filename[:-4] + ".wav"

    sound = AudioSegment.from_mp3(filename)
    sound.export(converted_filename, format = "wav")

    sample_rate, data = wavfile.read(converted_filename)
    return sample_rate, data

def spectrum(note_name):
    # get fundamental frequency by subtracting mean and then doing fourier transform and selecting peak
    sample_rate, data = mp3_signal(f"notes/{note_name}.mp3")
    num_samples = data.shape[0]
    # In case the left and right ear signals are out of phase by exactly half of the peak frequency,
    # don't immediately combine them into a monophonic signal
    signal_left  = data[:, 0]
    signal_right = data[:, 1]
    fft_left  = np.absolute(fft(signal_left ) / num_samples)[:num_samples // 2]
    fft_right = np.absolute(fft(signal_right) / num_samples)[:num_samples // 2]
    fft_frequencies = fftfreq(num_samples, 1 / sample_rate)[:num_samples // 2]

    fft_total = np.absolute(fft_left) + np.absolute(fft_right)
    return fft_total, fft_frequencies

def interpolate(x_data, y_data, x):
    # linearly interpolates between points in a signal, given by strictly increasing
    # x data and the corresponding y data
    i = np.searchsorted(x_data, x)
    fract = (x - x_data[i-1]) / (x_data[i] - x_data[i-1])
    return fract * y_data[i] + (1 - fract) * y_data[i-1]

# x axis represents half steps above A0, and
# y axis represents cents above ideal frequency
y_min = -500
y_max = 2500
y_step = .1
y_resolution = int((y_max - y_min) / y_step)
M = np.zeros((y_resolution, 88))

for j in range(88):
    note_name = ["A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab"][j % 12] + str((j + 9) // 12);

    ideal_frequency = 27.5 * 2 ** (j / 12)
    note_fft, note_frequencies = spectrum(note_name)
    note_fft /= np.max(note_fft)
    for i in range(y_resolution):
        y = y_min + i * y_step
        amplitude = interpolate(note_frequencies, note_fft, ideal_frequency * 2 ** (y / 1200))
        M[y_resolution - i - 1, j] = amplitude ** .5

ax = plt.axes()
plt.figure(figsize = (5, 7))
plt.imshow(M, aspect="auto", interpolation="none", extent=[1, 88, -500, 2500])
plt.title("Amplitude of each piano key at a given frequency")
plt.xlabel("x = number of half steps above A0")
plt.ylabel("y = cents above expected fundamental frequency\n(which is 27.5 * 2^(x/12) Hertz)")
plt.tight_layout()
plt.savefig("spectral_analysis.png")
