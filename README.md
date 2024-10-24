# WebGL Particle System

This project implements a particle simulation where charged particles (protons and electrons) interact with each other. The simulation is rendered using WebGL and provides an interactive experience where users can add and remove charges, control their speed, and manipulate visibility.

## Features

- **Add Charges**: Insert protons and electrons by clicking on the canvas.
- **Dynamic Grid**: A grid background is used to visualize the interaction field between particles.
- **Particle Movement**: Particles rotate and move, influenced by their velocity, which can be adjusted.
- **Interactive Controls**: You can pause the movement, hide charges, and accelerate or decelerate their movement.
- **Shader-Based Rendering**: The particles and grid are rendered using custom vertex and fragment shaders.

## Controls

- **Left Click**: Add a proton at the clicked position.
- **Shift + Click**: Add an electron at the clicked position.
- **Space**: Toggle visibility of charges.
- **Enter**: Pause/resume particle movement.
- **Arrow Right**: Increase the movement speed of particles.
- **Arrow Left**: Decrease the movement speed of particles.
- **Key D**: Remove the most recently added charge (proton/electron).

## How to Run

1. Clone this repository to your local machine
2. Use something like LiveServer on the WebGL-ChargeSimulator folder to host the application

Everything should run after that
