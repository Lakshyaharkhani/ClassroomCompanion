#!/bin/bash

# This script automates the process of seeding your Firebase Authentication
# with users from your project's data.js file.
#
# How to use:
# 1. Make sure you are logged into the Firebase CLI: `firebase login`
# 2. Make sure your project is selected: `firebase use <your-project-id>`
# 3. Make this script executable: `chmod +x seed-auth.sh`
# 4. Run the script from your project root: `./seed-auth.sh`

# Define the file paths
HELPER_SCRIPT="generate-users-csv.mjs"
USER_CSV="users.csv"
DATA_FILE="./src/lib/data.js"

echo "Creating helper script to generate user CSV..."

# Create a temporary Node.js script to extract user data
# Using .mjs to ensure ES Module support for imports
cat > $HELPER_SCRIPT << EOL
import { seedStudents, seedStaff, seedAdmin } from '$DATA_FILE';

const allUsers = [...seedStudents, ...seedStaff, seedAdmin];
const password = "password123";

// Create CSV header
console.log("email,password");

// Create CSV rows
allUsers.forEach(user => {
    if (user.email) {
        console.log(\`\${user.email},\${password}\`);
    }
});
EOL

echo "Helper script created."
echo "Generating $USER_CSV from $DATA_FILE..."

# Run the helper script with Node.js and redirect output to the CSV file
node $HELPER_SCRIPT > $USER_CSV

# Check if the CSV file was created successfully
if [ -s "$USER_CSV" ]; then
    echo "CSV file with user data has been generated successfully."
    echo "------------------------------------------------------"
    
    # Import the users into Firebase Authentication
    # The --hash-algo flag is crucial for importing plaintext passwords securely.
    echo "Starting import into Firebase Authentication..."
    firebase auth:import $USER_CSV --hash-algo=SCRYPT --rounds=8 --mem-cost=14
    
    echo "------------------------------------------------------"
    echo "Firebase Auth import process finished."
else
    echo "Error: Failed to generate $USER_CSV. Please check for errors."
fi

# Clean up the temporary files
echo "Cleaning up temporary files..."
rm $HELPER_SCRIPT
rm $USER_CSV

echo "Done."
