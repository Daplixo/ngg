// Game state management
export const gameState = {
    level: 1,
    maxNumber: 10,
    maxAttempts: 3,
    attempts: 0,
    randomNumber: null,
    gameOver: false,
    hasWon: false,
    waitingForNextLevel: false,
    finalWin: false,
    pastGuesses: [], // Track past guesses with their proximity values

    reset(resetEverything = true) {
        if (resetEverything) {
            this.level = 1;
            this.maxNumber = 10;
            this.maxAttempts = 3;
        }
        this.attempts = 0;
        this.gameOver = false;
        this.hasWon = false;
        this.finalWin = false;
        this.waitingForNextLevel = false;
        this.randomNumber = Math.floor(Math.random() * this.maxNumber) + 1;
        this.pastGuesses = []; // Clear past guesses
    },

    nextLevel() {
        this.level++;
        if (this.level === 2) {
            this.maxNumber = 50;
            this.maxAttempts = 4;
        } else if (this.level === 3) {
            this.maxNumber = 100;
            this.maxAttempts = 5;
        }
        this.reset(false);
    },
    
    // Add a method to add a guess with its proximity value
    addGuess(guess, proximityValue) {
        this.pastGuesses.push({
            value: guess,
            proximity: proximityValue
        });
    }
};