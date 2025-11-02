/*
==================================================================
HOW TO CREATE THE GOOGLE APPS SCRIPT FOR GOOGLE SHEETS
==================================================================
1. Go to script.google.com and create a new project.
2. Replace the code in Code.gs with the following:

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Submissions');
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Submissions');
      // Create headers
      sheet.appendRow([
        'Timestamp', 'Team Name', 'Project Title', 'Description', 
        'Member 1', 'Member 2', 'Member 3', 'Member 4', 
        'GitHub Link', 'Demo Link'
      ]);
    }
    
    var data = e.parameter;
    
    // Create a new row with timestamp first
    var newRow = [
      new Date(),
      data.teamName,
      data.projectTitle,
      data.projectDescription,
      data.member1,
      data.member2,
      data.member3,
      data.member4,
      data.githubLink,
      data.demoLink
    ];
    
    sheet.appendRow(newRow);
    
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', message: 'Row appended' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

3. Click "Deploy" > "New deployment".
4. For "Select type", choose "Web app".
5. In the description, type "Vibe Coding Submission Form".
6. For "Execute as", select "Me (your email)".
7. For "Who has access", select "Anyone". **THIS IS CRITICAL.**
8. Click "Deploy".
9. Authorize the script when prompted.
10. Copy the "Web app URL" and paste it into the GOOGLE_APPS_SCRIPT_URL constant in your submission.html file.
==================================================================
*/


// Helper function for fetch with exponential backoff
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
    lucide.createIcons();

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
            // Apply green success styles
            formMessage.className = 'text-center text-lg p-3 rounded-lg bg-emerald-800/50 border border-emerald-600 text-emerald-300';
        } else {
            // Apply red error styles
            formMessage.className = 'text-center text-lg p-3 rounded-lg bg-red-800/50 border border-red-600 text-red-300';
        }
        formMessage.classList.remove('hidden'); // Make the message visible
    }

    // Check if the submission form exists on this page
    if (form) {
        // Add the submit event listener to the form
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent the default browser form submission

            // Validate that the Google Apps Script URL has been set
            if (typeof GOOGLE_APPS_SCRIPT_URL === 'undefined' || GOOGLE_APPS_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
                showFormMessage('ERROR: Please configure the GOOGLE_APPS_SCRIPT_URL in the HTML file first.', 'error');
                return;
            }

            // --- Show loading state on the button ---
            submitButton.disabled = true;
            submitText.classList.add('hidden');
            submitSpinner.classList.remove('hidden');
            formMessage.classList.add('hidden'); // Hide any previous messages

            const formData = new FormData(form);

            // --- Send data to Google Apps Script with backoff ---
            fetchWithBackoff(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                body: formData,
            }, 3) // 3 retries
            .then(response => {
                if (!response.ok) {
                    // Try to parse error from Google Script if available
                    return response.json().then(err => {
                        throw new Error(err.message || 'Network response was not ok.');
                    });
                }
                return response.json(); // Parse successful response
            })
            .then(data => {
                if (data.result === 'success') {
                    // Show success message and reset the form
                    showFormMessage('PROJECT TRANSMITTED: Data received successfully! Good luck, operatives!', 'success');
                    form.reset();
                } else {
                    // Show error message from Google Apps Script
                    throw new Error(data.message || 'An unknown error occurred during transmission.');
                }
            })
            .catch(error => {
                // Show any other errors (network, etc.)
                console.error('Transmission Error:', error);
                showFormMessage(`TRANSMISSION FAILED: ${error.message}. Recalibrating... Please try again.`, 'error');
            })
            .finally(() => {
                // --- Hide loading state ---
                submitButton.disabled = false;
                submitText.classList.remove('hidden');
                submitSpinner.classList.add('hidden');
            });
        });
    }
});
