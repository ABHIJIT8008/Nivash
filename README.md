Open the .env file and populate it with your specific database URI and API keys (see Environment Variables section below).

Bash
# 1. Start the backend development server
npm run dev
The server should now be running and listening on http://localhost:5000.

Mobile App Setup (React Native)
Bash
# 2. Navigate to the mobile app directory
cd mobile-app

# 3. Install all required dependencies
npm install

# 4. Start the Metro bundler
npx react-native start
In a new terminal window:

Bash
# 5. Compile and run the application on your connected Android device or emulator
npx react-native run-android
🔐 Environment Variables (.env)
Create a .env file in the root of the backend directory. Do not commit this file to version control.

Code snippet
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://127.0.0.1:27017/nivash_db

# Security
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=30d

# Cloudinary Integration (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

👥 Project Team Members

Abhijit Gupta

Aditya Verma

Ayushi Meena

Himanshu Patidar
