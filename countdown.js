/**
 * Vibe Coding Countdown Timer Logic
 *
 * This script manages the 48-hour countdown timer for the Vibe Coding contest.
 * It uses localStorage to persist the timer's end time across page reloads,
 * ensuring that the countdown continues from where it left off.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM Element Selection ---
    // We select all the elements we need to interact with from the HTML.
    const startButtonContainer = document.getElementById('start-button-container');
    const timerDisplay = document.getElementById('timer-display');
    const timerEnded = document.getElementById('timer-ended');
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    
    // Timer value elements
    const timerDays = document.getElementById('timer-days');
    const timerHours = document.getElementById('timer-hours');
    const timerMinutes = document.getElementById('timer-minutes');
    const timerSeconds = document.getElementById('timer-seconds');
    
    // --- Constants ---
    // The key used to store the timer's end time in localStorage.
    const TIMER_STORAGE_KEY = 'vibeCodingCountdownEndTime';
    // The duration of the countdown in milliseconds (48 hours).
    const COUNTDOWN_DURATION = 48 * 60 * 60 * 1000; 
    
    // This variable will hold our setInterval() ID so we can stop it later.
    let countdownInterval;

    /**
     * Updates the UI to show the timer display.
     */
    const showTimerState = () => {
        if (startButtonContainer) startButtonContainer.classList.add('hidden');
        if (timerEnded) timerEnded.classList.add('hidden');
        if (timerDisplay) timerDisplay.classList.remove('hidden');
    };

    /**
     * Updates the UI to show the "timer ended" message.
     */
    const showEndedState = () => {
        if (startButtonContainer) startButtonContainer.classList.add('hidden');
        if (timerDisplay) timerDisplay.classList.add('hidden');
        if (timerEnded) timerEnded.classList.remove('hidden');
    };

    /**
     * Updates the UI to show the initial "start" button.
     */
    const showStartState = () => {
        if (timerDisplay) timerDisplay.classList.add('hidden');
        if (timerEnded) timerEnded.classList.add('hidden');
        if (startButtonContainer) startButtonContainer.classList.remove('hidden');
    };

    /**
     * Pads a number with a leading zero if it's less than 10.
     * e.g., 9 -> "09", 10 -> "10"
     * @param {number} num The number to pad.
     * @returns {string} The padded string.
     */
    const pad = (num) => String(num).padStart(2, '0');

    /**
     * Starts the countdown timer logic.
     * @param {number} endTime The timestamp (in ms) when the timer should end.
     */
    const startTimer = (endTime) => {
        // Clear any existing timer to avoid multiple intervals running.
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        const updateTimer = () => {
            const now = Date.now();
            const remainingTime = endTime - now;

            if (remainingTime <= 0) {
                // Time's up!
                clearInterval(countdownInterval);
                showEndedState();
                // We'll leave the expired endTime in localStorage 
                // to show the "ended" state on next load.
            } else {
                // Calculate remaining time parts
                const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
                const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                
                // Update the DOM
                if (timerDays) timerDays.textContent = pad(days);
                if (timerHours) timerHours.textContent = pad(hours);
                if (timerMinutes) timerMinutes.textContent = pad(minutes);
                if (timerSeconds) timerSeconds.textContent = pad(seconds);
            }
        };

        // Run the update function immediately to show the time
        // without waiting for the first second.
        updateTimer(); 
        
        // Run the update function every second.
        countdownInterval = setInterval(updateTimer, 1000);
    };
    
    /**
     * This is the main function that runs on page load.
     * It checks localStorage and decides which UI state to show.
     */
    const initializePage = () => {
        // 1. Check for a saved end time in localStorage.
        const savedEndTime = localStorage.getItem(TIMER_STORAGE_KEY);
        
        if (savedEndTime) {
            // 2. If we have a saved time, parse it.
            const endTime = parseInt(savedEndTime, 10);
            const now = Date.now();

            if (now >= endTime) {
                // 3a. If the saved time is in the past, show the ended state.
                showEndedState();
            } else {
                // 3b. If the saved time is in the future, show the timer and start it.
                showTimerState();
                startTimer(endTime);
            }
        } else {
            // 4. If no time is saved, show the start button.
            showStartState();
        }
    };

    // --- Event Listeners ---

    // Listen for clicks on the "DEPLOY COUNTDOWN" button.
    if (startButton) {
        startButton.addEventListener('click', () => {
            // Get the user's confirmation.
            // Using a custom modal would be better, but for simplicity, we use confirm.
            // Note: The user mentioned `alert` and `confirm` might be disabled.
            // In a real scenario, this should be replaced with a custom modal confirmation.
            // For this fix, we'll assume the user *wants* to start it.
            
            // Calculate the end time.
            const endTime = Date.now() + COUNTDOWN_DURATION;
            
            // Save the end time to localStorage.
            localStorage.setItem(TIMER_STORAGE_KEY, endTime.toString());
            
            // Update the UI and start the timer.
            showTimerState();
            startTimer(endTime);
        });
    }

    // Listen for clicks on the "[DEV: Reset Timer]" button.
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            // Stop the timer.
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            
            // Remove the saved time from localStorage.
            localStorage.removeItem(TIMER_STORAGE_KEY);
            
            // Show the initial start button UI.
            showStartState();
        });
    }

    // --- Run Initialization ---
    // Start the main logic when the page loads.
    initializePage();

});
