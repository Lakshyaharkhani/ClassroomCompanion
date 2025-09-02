
"use server";

import { db } from "../lib/firebase";
import { collection, writeBatch, doc, setDoc } from "firebase/firestore";
import { seedStudents, seedStaff, seedAdmin, seedClasses } from "../lib/data.js";
import { getAuth } from "firebase-admin/auth";
import { initializeAdminApp } from "../lib/firebase-admin";

// AI-related functionalities are not supported in this JS-only project.
// The original code was dependent on Genkit with TypeScript.
export async function suggestClassName(input) {
    console.log("suggestClassName called with:", input);
    // Return mock data as the AI flow is not available.
    return Promise.resolve({
        suggestions: [
            "Intro to JavaScript",
            "Web Development 101",
            "React for Beginners",
            "Advanced JSX",
            "Frontend Masters",
        ],
    });
}

export async function createAdminUser(userData) {
    try {
        const app = await initializeAdminApp();
        const auth = getAuth(app);
        
        // 1. Create user in Firebase Authentication
        const userRecord = await auth.createUser({
            email: userData.email,
            password: userData.password,
            displayName: userData.name,
            disabled: false,
        });

        // 2. Create user document in Firestore
        const newUser = {
            name: userData.name,
            email: userData.email,
            role: 'admin',
        };
        
        // Use a consistent doc ID based on the email
        const docId = userData.email.replace(/[^a-zA-Z0-9]/g, "");
        await setDoc(doc(db, "users", docId), newUser);

        return { success: true, message: `Admin user ${userData.name} created successfully.` };
    } catch (error) {
        console.error("Error creating admin user:", error);
        // Provide a more user-friendly error message
        let message = "An unexpected error occurred.";
        if (error.code === 'auth/email-already-exists') {
            message = "This email address is already in use by another account.";
        } else if (error.code === 'auth/invalid-password') {
            message = "The password is not strong enough. It must be at least 6 characters long.";
        }
        return { success: false, message: message };
    }
}

export async function seedDatabase() {
    try {
        const batch = writeBatch(db);

        // Seed Users (Students, Staff, Admin)
        const allUsers = [...seedStudents, ...seedStaff, seedAdmin];
        allUsers.forEach(user => {
            const docId = user.email.replace(/[^a-zA-Z0-9]/g, "");
            const userRef = doc(db, "users", docId);
            batch.set(userRef, user);
        });
        console.log(`Prepared ${allUsers.length} users for seeding.`);

        // Seed Classes
        seedClasses.forEach(cls => {
            const classRef = doc(db, "classes", cls.class_id);
            batch.set(classRef, cls);
        });
        console.log(`Prepared ${seedClasses.length} classes for seeding.`);

        await batch.commit();
        console.log("Database seeded successfully!");
        return { success: true, message: "Database seeded successfully with users and classes. Please manually create user accounts in Firebase Authentication." };

    } catch (error) {
        console.error("Error seeding database: ", error);
        return { success: false, message: "An error occurred while seeding the database." };
    }
}
