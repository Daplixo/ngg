# Number Guessing Game

A simple and fun number guessing game with multiple levels of increasing difficulty.

## Features

- Progressive difficulty levels
- Intuitive user interface
- Sound effects for win/lose conditions
- Mobile-friendly design
- Works offline (PWA)

## How to Play

1. Start a new game
2. Guess a number within the given range
3. Use the hints provided to guess correctly
4. Progress through increasingly difficult levels
5. Try to complete all levels with minimum attempts!

## Levels

1. Level 1: Numbers 1-10 (3 attempts)
2. Level 2: Numbers 1-50 (4 attempts)
3. Level 3: Numbers 1-100 (5 attempts)

(Note: Although the game was originally envisioned to support 10 levels, only the first 3 levels are implemented in the current build.)

## Installation

1. Clone this repository
2. Open index.html in your browser
3. Start playing!

Or simply visit the live version at [Number Guessing Game](https://Daplixo.github.io/ngg/)

## Development

Built with vanilla JavaScript, HTML, and CSS. Uses the following features:

- ES6 Modules
- Service Workers for offline support
- Local Storage for game state
- Web Audio API for sound effects
- Responsive design with CSS Grid/Flexbox

## Dev Reflection

This project began as a fun challenge — just me vibe-coding my way through a silly idea. I didn't plan every feature, I just let the project evolve. And that came with its own chaos.

It works — yeah, the game plays fine. Open it in a browser, and you’ll get the full experience: smooth UI, fun sound effects, working feedback, and 3 playable levels. But under the surface? It’s a bloated mess.

There are way too many files. More than half of the JavaScript is probably dead code. Lots of modules overlap, some are just leftover patches from bugs I tried to fix in the moment. It's not scalable, not clean, and definitely not professional. 

But that’s okay. I learned a lot. Not just how to use service workers or local storage, but how easy it is to dig yourself into a rabbit hole when you don’t have structure. This is a living record of my trial, my errors, and my growth.

## What’s Next

I’ll be rebuilding this project from scratch. Proper folder structure. Clean, modular JS. No repeated code. Everything organized like it should’ve been from the beginning.

Because this time — I’ll do it manually, like a pro.

---

MIT License — feel free to explore, use, and learn from this chaotic but honest project.

