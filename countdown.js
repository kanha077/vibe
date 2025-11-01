// === SHARED TIMER SCRIPT ===
// This script is loaded by both index.html and submission.html
// It uses localStorage to keep the timer in sync across pages.

document.addEventListener('DOMContentLoaded', () => {
    // Find timer-related elements on the page
    const startButtonContainer = document.getElementById('start-button-container');
    const startButton = document.getElementById('start-button');
    const timerDisplay = document.getElementById('timer-display');
    const timerEnded = document.getElementById('timer-ended');
    const timerSection = document.getElementById('timer-section');
    
    const daysEl = document.getElementById('timer-days');
    const hoursEl = document.getElementById('timer-hours');
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');
    
    // [NEW] Get the reset button
    const resetButton = document.getElementById('reset-button');
    
    // Find form elements for disabling when time is up
    const form = document.getElementById('submission-form');
    const submitButton = document.getElementById('submit-button');

    // --- Config ---
    const EVENT_DURATION = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
    let countdownInterval;

    /**
     * Starts the visual countdown interval
     * @param {number} endTime - The timestamp when the event ends
     */
    function startCountdown(endTime) {
        // Clear any existing interval
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        countdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                // Timer ended
                clearInterval(countdownInterval);
                if(timerDisplay) timerDisplay.classList.add('hidden');
                if(timerEnded) timerEnded.classList.remove('hidden');
                
                // Change timer section glow to red
                if(timerSection) {
                    timerSection.style.boxShadow = '0 0 30px rgba(255, 0, 0, 0.4)'; 
                    
                    // This is a more complex way to target pseudo-elements,
                    // but a better way is to add a CSS class.
                    // For simplicity, we'll just add a class.
                    timerSection.classList.add('timer-expired');
                }

                // Disable the form if it exists on this page
                if(form) {
                    form.querySelectorAll('input, textarea, button').forEach(el => {
                        el.disabled = true;
                    });
                }
                if(submitButton) {
                    // Check for submit-text span to avoid errors
                    const submitText = document.getElementById('submit-text');
                    if (submitText) {
                        submitText.textContent = 'Submissions Closed';
                    } else {
                        submitButton.textContent = 'Submissions Closed';
                    }
                    submitButton.disabled = true;
                }

            } else {
                // Update timer
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                // Update elements only if they exist
                if(daysEl) daysEl.textContent = String(days).padStart(2, '0');
                if(hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
                if(minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
                if(secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
            }
        }, 1000);
    }

    /**
     * Initializes the timer state based on localStorage
     */
    function initTimer() {
        const storedEndTime = localStorage.getItem('eventEndTime');

        // Check if timer-related elements exist before manipulating them
        if (storedEndTime) {
            // Event is active or over
            if(startButtonContainer) startButtonContainer.classList.add('hidden');
            if(timerDisplay) timerDisplay.classList.remove('hidden');
            startCountdown(parseInt(storedEndTime, 10));
        } else {
            // Event has not started
            if(startButtonContainer) startButtonContainer.classList.remove('hidden');
            if(timerDisplay) timerDisplay.classList.add('hidden');
            if(timerEnded) timerEnded.classList.add('hidden');
        }
    }

    // Start button click listener
    if (startButton) {
        startButton.addEventListener('click', () => {
            // NOTE: window.confirm() will block the browser.
            // A custom modal is better, but this works.
            if (window.confirm('Are you sure you want to start the 48-hour countdown? This action cannot be undone and will be visible to everyone.')) {
                const endTime = new Date().getTime() + EVENT_DURATION;
                localStorage.setItem('eventEndTime', endTime);
                initTimer(); // Re-initialize to show the timer
            }
        });
    }

    // [NEW] Add a click listener for the development reset button
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            // We use a confirm here just to be safe, even in dev.
            if (window.confirm('DEVELOPER: Are you sure you want to clear the timer from localStorage and reload?')) {
                localStorage.removeItem('eventEndTime');
                window.location.reload();
            }
        });
    }

    // Add a class to the style to handle the expired glow
    // This is cleaner than trying to change pseudo-elements with JS
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        .tech-container.timer-expired::before {
            background: conic-gradient(transparent, rgba(255, 0, 0, 0.5), transparent 30%, transparent 70%, rgba(255, 0, 0, 0.5), transparent) !important;
        }
    `;
    document.head.appendChild(styleSheet);

    // Initialize timer on page load
    initTimer();
});
