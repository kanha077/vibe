/**
 * Vibe Coding Countdown Timer Logic
 *
 * This script manages the 48-hour countdown timer for the Vibe Coding contest.
 * It uses FIREBASE FIRESTORE to persist the timer's end time across page reloads
 * and sync it across all devices in real-time.
 */

// --- Firebase SDK Imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    onSnapshot,
    setLogLevel
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// -------------------------------------------------------------------
//  Your web app's Firebase configuration
//  (Pasted from your last message)
// -------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBTDlUMbYV6vSj91ul35yuCow8IhK2-WH8",
  authDomain: "chromameet-a2im7.firebaseapp.com",
  projectId: "chromameet-a2im7",
  storageBucket: "chromameet-a2im7.firebasestorage.app",
  messagingSenderId: "272766220764",
  appId: "1:272766220764:web:c58a26015523d9900df719"
};
// -------------------------------------------------------------------

// --- DOM Element Selection ---
const startButtonContainer = document.getElementById('start-button-container');
const timerDisplay = document.getElementById('timer-display');
const timerEnded = document.getElementById('timer-ended');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');
const timerDays = document.getElementById('timer-days');
const timerHours = document.getElementById('timer-hours');
const timerMinutes = document.getElementById('timer-minutes');
const timerSeconds = document.getElementById('timer-seconds');

// --- Constants ---
const COUNTDOWN_DURATION = 48 * 60 * 60 * 1000; // 48 hours in ms
let countdownInterval;

// --- Firebase & App Initialization ---
// These variables are provided by the environment, but we'll use your Project ID from the config
const appId = firebaseConfig.projectId || (typeof __app_id !== 'undefined' ? __app_id : 'default-app-id');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app, auth, db;

// Check if a valid config is provided
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("YOUR_API_KEY")) {
    console.error("Firebase config is missing or is still a placeholder.");
    // Show a user-friendly error on the page
    if(startButtonContainer) {
        startButtonContainer.innerHTML = `<p class="text-red-600 font-bold">TIMER ERROR: Firebase is not configured.</p>`;
        startButtonContainer.classList.remove('hidden');
    }
} else {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        setLogLevel('Debug'); // Enable Firestore logging
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
}

// Define the path to our single timer document in Firestore
// We use the `appId` (your project ID) to keep the path consistent.
const timerDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'contest_timer', 'main');


// --- UI Helper Functions ---
const showTimerState = () => {
    if (startButtonContainer) startButtonContainer.classList.add('hidden');
    if (timerEnded) timerEnded.classList.add('hidden');
    if (timerDisplay) timerDisplay.classList.remove('hidden');
};

const showEndedState = () => {
    if (startButtonContainer) startButtonContainer.classList.add('hidden');
    if (timerDisplay) timerDisplay.classList.add('hidden');
    if (timerEnded) timerEnded.classList.remove('hidden');
};

const showStartState = () => {
    if (startButtonContainer) {
        if (timerDisplay) timerDisplay.classList.add('hidden');
        if (timerEnded) timerEnded.classList.add('hidden');
        if (startButtonContainer) startButtonContainer.classList.remove('hidden');
    }
};

const pad = (num) => String(num).padStart(2, '0');

// --- Timer Logic ---
const startTimer = (endTime) => {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    const updateTimer = () => {
        const now = Date.now();
        const remainingTime = endTime - now;

        if (remainingTime <= 0) {
            clearInterval(countdownInterval);
            showEndedState();
        } else {
            const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
            
            if (timerDays) timerDays.textContent = pad(days);
            if (timerHours) timerHours.textContent = pad(hours);
            if (timerMinutes) timerMinutes.textContent = pad(minutes);
            if (timerSeconds) timerSeconds.textContent = pad(seconds);
        }
    };

    updateTimer();
    countdownInterval = setInterval(updateTimer, 1000);
};

/**
 * Main function to initialize all timer logic.
 */
const initializeTimerLogic = () => {
    console.log("Initializing Timer Logic...");

    onSnapshot(timerDocRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().endTime) {
            const endTime = docSnap.data().endTime;
            const now = Date.now();

            if (now >= endTime) {
                showEndedState();
            } else {
                showTimerState();
                startTimer(endTime);
            }
        } else {
            // No timer exists in the database
            if (countdownInterval) clearInterval(countdownInterval);
            showStartState();
        }
    }, (error) => {
        console.error("Error listening to timer document: ", error);
        // This can happen if Firestore rules are not set correctly
        if (countdownInterval) clearInterval(countdownInterval);
        showStartState();
    });

    // --- Event Listeners ---
    if (startButton) {
        startButton.addEventListener('click', async () => {
            console.log("Start button clicked. Writing to Firestore...");
            try {
                const endTime = Date.now() + COUNTDOWN_DURATION;
                // This will create/overwrite the document and trigger the onSnapshot listener
                await setDoc(timerDocRef, { endTime: endTime });
                console.log("Timer started in Firestore!");
            } catch (e) {
                console.error("Error starting timer in Firestore: ", e);
            }
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', async () => {
            console.log("Reset button clicked. Updating Firestore...");
            try {
                if (countdownInterval) {
                    clearInterval(countdownInterval);
                }
                // Setting endTime to null will trigger onSnapshot to show the start state
                await setDoc(timerDocRef, { endTime: null });
                console.log("Timer reset in Firestore.");
            } catch (e) {
                console.error("Error resetting timer in Firestore: ", e);
            }
        });
    }
};

// --- Authentication Flow ---
if (auth) { // Only proceed if Firebase initialized
    console.log("Authenticating...");
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in.
            console.log("User authenticated:", user.uid);
            initializeTimerLogic(); // Start the app logic
        } else {
            // User is not signed in.
            console.log("No user found, signing in...");
            try {
                // Use token if provided (like in a secure environment)
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                    console.log("Signed in with custom token.");
                } else {
                    // Otherwise, sign in anonymously for this demo
                    await signInAnonymously(auth);
                    console.log("Signed in anonymously.");
                }
                // The onAuthStateChanged listener will fire again
                // and the 'if (user)' block will run.
            } catch (error) {
                console.error("Authentication failed: ", error);
            }
        }
    });
}

