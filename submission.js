
async function fetchWithBackoff(url, options, retries = 3, delay = 1000) {
    // This function will try to fetch a resource, retrying with exponential backoff if it fails.
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.status === 500 || response.status === 503 || response.status === 429) {
                // Retry on server errors or rate limiting
                throw new Error(`Server error: ${response.status}`);
            }
            return response; // Success
        } catch (error) {
            if (i === retries - 1) throw error; // Last retry failed
            // Wait for the specified delay before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Double the delay for the next attempt
        }
    }
}

// === FORM SUBMISSION SCRIPT ===
document.addEventListener('DOMContentLoaded', () => {
    // Activate Lucide Icons as soon as the DOM is ready
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Get all necessary elements from the DOM
    const form = document.getElementById('submission-form');
    const submitButton = document.getElementById('submit-button');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');
    const formMessage = document.getElementById('form-message');

    /**
     * Helper function to show form messages (success or error)
     * @param {string} message - The message to display.
     * @param {'success' | 'error'} type - The type of message.
     */
    function showFormMessage(message, type) {
        if (!formMessage) return; // Don't run if element doesn't exist
        
        formMessage.textContent = message;
        if (type === 'success') {
            // Apply light green success styles
            formMessage.className = 'text-center text-lg p-3 rounded-lg bg-green-100 border border-green-300 text-green-800';
        } else {
            // Apply light red error styles
            formMessage.className = 'text-center text-lg p-3 rounded-lg bg-red-100 border border-red-300 text-red-800';
        }
        formMessage.classList.remove('hidden'); 
    }

 
    if (form) {
       
        form.addEventListener('submit', (e) => {
            e.preventDefault(); 

            if (typeof GOOGLE_APPS_SCRIPT_URL === 'undefined' || GOOGLE_APPS_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
                showFormMessage('ERROR: Please configure the GOOGLE_APPS_SCRIPT_URL in the HTML file first.', 'error');
                return;
            }

           
            submitButton.disabled = true;
            submitText.classList.add('hidden');
            submitSpinner.classList.remove('hidden');
            formMessage.classList.add('hidden'); 

            const formData = new FormData(form);

            
            fetchWithBackoff(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                body: formData,
            }, 3) // 3 retries
            .then(response => {
                if (!response.ok) {
                    
                    return response.json().then(err => {
                        throw new Error(err.message || 'Network response was not ok.');
                    });
                }
                return response.json(); 
            })
            .then(data => {
                if (data.result === 'success') {
                    
                    showFormMessage('PROJECT TRANSMITTED: Data received successfully! Good luck, operatives!', 'success');
                    form.reset();
                    
                   
                    const toggle = document.getElementById('toggle-submission-type');
                    if (toggle) {
                        toggle.checked = false;
                        
                        toggle.dispatchEvent(new Event('change'));
                    }

                } else {
                
                    throw new Error(data.message || 'An unknown error occurred during transmission.');
                }
            })
            .catch(error => {
                
                console.error('Transmission Error:', error);
                showFormMessage(`TRANSMISSION FAILED: ${error.message}. Recalibrating... Please try again.`, 'error');
            })
            .finally(() => {
                submitButton.disabled = false;
                submitText.classList.remove('hidden');
                submitSpinner.classList.add('hidden');
            });
        });
    }
});

