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

    // Save the current game state to localStorage
    saveState() {
        const stateToSave = {
            level: this.level,
            maxNumber: this.maxNumber,
            maxAttempts: this.maxAttempts,
            attempts: this.attempts,
            randomNumber: this.randomNumber,
            gameOver: this.gameOver,
            hasWon: this.hasWon,
            waitingForNextLevel: this.waitingForNextLevel,
            finalWin: this.finalWin,
            pastGuesses: this.pastGuesses
        };
        
        try {
            localStorage.setItem('numberGuessGameState', JSON.stringify(stateToSave));
            console.log('Game state saved');
        } catch (error) {
            console.error('Failed to save game state:', error);
        }
    },

    // Load saved game state from localStorage
    loadState() {
        try {
            const savedState = localStorage.getItem('numberGuessGameState');
            
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                
                // Load all saved properties
                this.level = parsedState.level || 1;
                this.maxNumber = parsedState.maxNumber || 10;
                this.maxAttempts = parsedState.maxAttempts || 3;
                this.attempts = parsedState.attempts || 0;
                this.randomNumber = parsedState.randomNumber || Math.floor(Math.random() * this.maxNumber) + 1;
                this.gameOver = parsedState.gameOver || false;
                this.hasWon = parsedState.hasWon || false;
                this.waitingForNextLevel = parsedState.waitingForNextLevel || false;
                this.finalWin = parsedState.finalWin || false;
                this.pastGuesses = parsedState.pastGuesses || [];
                
                console.log(`Game state loaded: Level ${this.level}, Attempts: ${this.attempts}/${this.maxAttempts}`);
                return true;
            }
        } catch (error) {
            console.error('Failed to load game state:', error);
        }
        
        return false;
    },

    // Clear saved game state from localStorage
    clearSavedState() {
        try {
            localStorage.removeItem('numberGuessGameState');
            console.log('Saved game state cleared');
        } catch (error) {
            console.error('Failed to clear saved game state:', error);
        }
    },

    reset(resetEverything = true) {
        if (resetEverything) {
            this.level = 1;
            this.maxNumber = 10;
            this.maxAttempts = 3;
            // Also clear saved state when doing a full reset
            this.clearSavedState();
        }
        this.attempts = 0;
        this.gameOver = false;
        this.hasWon = false;
        this.finalWin = false;
        this.waitingForNextLevel = false;
        this.randomNumber = Math.floor(Math.random() * this.maxNumber) + 1;
        this.pastGuesses = []; // Clear past guesses
        
        // Save the fresh state
        this.saveState();
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
        // State is saved in reset()
    },
    
    // Add a method to add a guess with its proximity value
    addGuess(guess, proximityValue) {
        this.pastGuesses.push({
            value: guess,
            proximity: proximityValue
        });
        
        // Save state after each guess
        this.saveState();
    }
};