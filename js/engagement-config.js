// Fill in your Firebase project config, then set enabled to true.
export const ENGAGEMENT_CONFIG = {
    enabled: false,
    firebase: {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    },
    // Count at most once per page key in this period for the same browser.
    viewThrottleMinutes: 30
};
