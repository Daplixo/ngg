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
        
        // ADDED: Make sure attempts is explicitly reset to 0
        this.attempts = 0;
        
        // Reset other game state properties
        this.gameOver = false;
        this.hasWon = false;
        this.finalWin = false;
        this.waitingForNextLevel = false;
        this.randomNumber = Math.floor(Math.random() * this.maxNumber) + 1;
        this.pastGuesses = []; // Clear past guesses
        
        // Save the updated state
        this.saveState();
        
        console.log(`Level ${this.level} started with ${this.maxAttempts} attempts (0/${this.maxAttempts})`);
    },
    
    // Add a method to add a guess with its proximity value
    addGuess(guess, proximityValue) {
        this.pastGuesses.push({
            value: guess,
            proximity: proximityValue
        });
        
        // Save state after each guess
        this.saveState();
    },

    // Check if there's a valid saved game that can be restored
    hasSavedGame() {
        try {
            const savedState = localStorage.getItem('numberGuessGameState');
            if (!savedState) {
                console.log("No saved game state found in localStorage");
                return false;
            }
            
            // Parse the state to verify it's valid JSON
            const parsedState = JSON.parse(savedState);
            
            // Basic validation - make sure it has the essential properties
            if (!parsedState || typeof parsedState !== 'object') {
                console.log("Invalid saved game format");
                return false;
            }
            
            if (!('level' in parsedState) || !('randomNumber' in parsedState)) {
                console.log("Missing required properties in saved game");
                return false;
            }
            
            // Compare with current game state - don't restore if it's the same game
            const isSameGame = (
                this.level === parsedState.level &&
                this.attempts === parsedState.attempts &&
                this.randomNumber === parsedState.randomNumber
            );
            
            if (isSameGame) {
                console.log("Saved game is the same as current game");
                return false;
            }
            
            // Look for evidence of progress or completion
            const hasProgress = (
                parsedState.level > 1 || 
                parsedState.attempts > 0 ||
                parsedState.gameOver ||
                parsedState.hasWon
            );
            
            if (!hasProgress) {
                console.log("No progress in saved game");
                return false;
            }
            
            console.log("Valid saved game found that can be restored");
            return true;
        } catch (error) {
            console.error('Error checking for saved game:', error);
            return false;
        }
    }
};