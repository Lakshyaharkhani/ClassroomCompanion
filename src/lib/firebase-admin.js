
import admin from 'firebase-admin';

// This function assembles the service account credentials from environment variables
function getServiceAccount() {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set.");
    }
    
    return {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key needs to have its escaped newlines replaced with actual newlines
        privateKey: privateKey.replace(/\\n/g, '\n'),
    };
}

export async function initializeAdminApp() {
    // Check if the app is already initialized to prevent errors
    if (admin.apps.length > 0) {
        return admin.app();
    }

    try {
        const serviceAccount = getServiceAccount();
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch(error) {
        console.error("Failed to initialize Firebase Admin SDK:", error);
        throw new Error("Could not connect to Firebase services. Please check server configuration.");
    }
}
