

document.addEventListener('DOMContentLoaded', () => {
    const startButtonContainer = document.getElementById('start-button-container');
    const startButton = document.getElementById('start-button');
    const timerDisplay = document.getElementById('timer-display');
    const timerEnded = document.getElementById('timer-ended');
    const timerSection = document.getElementById('timer-section');
    
    const daysEl = document.getElementById('timer-days');
    const hoursEl = document.getElementById('timer-hours');
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');
    
    const resetButton = document.getElementById('reset-button');
    
    const form = document.getElementById('submission-form');
    const submitButton = document.getElementById('submit-button');

    // --- Config ---
    const EVENT_DURATION = 48 * 60 * 60 * 1000; 
    let countdownInterval;

    /**
     * Starts the visual countdown interval
     * @param {number} endTime - The timestamp when the event ends
     */
    function startCountdown(endTime) {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        countdownInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                clearInterval(countdownInterval);
                if(timerDisplay) timerDisplay.classList.add('hidden');
                if(timerEnded) timerEnded.classList.remove('hidden');
                
                if(timerSection) {
                    timerSection.style.boxShadow = '0 0 30px rgba(255, 0, 0, 0.4)'; 
                    
                    
                    timerSection.classList.add('timer-expired');
                }

                
                if(form) {
                    form.querySelectorAll('input, textarea, button').forEach(el => {
                        el.disabled = true;
                    });
                }
                if(submitButton) {
                   
                    const submitText = document.getElementById('submit-text');
                    if (submitText) {
                        submitText.textContent = 'Submissions Closed';
                    } else {
                        submitButton.textContent = 'Submissions Closed';
                    }
                    submitButton.disabled = true;
                }

            } else {
               
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                
                if(daysEl) daysEl.textContent = String(days).padStart(2, '0');
                if(hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
                if(minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
                if(secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
            }
        }, 1000);
    }


    function initTimer() {
        const storedEndTime = localStorage.getItem('eventEndTime');

        
        if (storedEndTime) {
            
            if(startButtonContainer) startButtonContainer.classList.add('hidden');
            if(timerDisplay) timerDisplay.classList.remove('hidden');
            startCountdown(parseInt(storedEndTime, 10));
        } else {
            
            if(startButtonContainer) startButtonContainer.classList.remove('hidden');
            if(timerDisplay) timerDisplay.classList.add('hidden');
            if(timerEnded) timerEnded.classList.add('hidden');
        }
    }

   
    if (startButton) {
        startButton.addEventListener('click', () => {
        
            if (window.confirm('Are you sure you want to start the 48-hour countdown? This action cannot be undone and will be visible to everyone.')) {
                const endTime = new Date().getTime() + EVENT_DURATION;
                localStorage.setItem('eventEndTime', endTime);
                initTimer();
            }
        });
    }

    
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            
            if (window.confirm('DEVELOPER: Are you sure you want to clear the timer from localStorage and reload?')) {
                localStorage.removeItem('eventEndTime');
                window.location.reload();
            }
        });
    }

S
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        .tech-container.timer-expired::before {
            background: conic-gradient(transparent, rgba(255, 0, 0, 0.5), transparent 30%, transparent 70%, rgba(255, 0, 0, 0.5), transparent) !important;
        }
    `;
    document.head.appendChild(styleSheet);

    initTimer();
});
