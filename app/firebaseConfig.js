// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyC7b-PC9MBTyR2VKEhEECNcxw5VMPqaPCs",
//   authDomain: "hackathon-1-8f769.firebaseapp.com",
//   projectId: "hackathon-1-8f769",
//   storageBucket: "hackathon-1-8f769.firebasestorage.app",
//   messagingSenderId: "429216825696",
//   appId: "1:429216825696:web:b17dd04c24165463941e05",
//   measurementId: "G-CMPX5018MF"
// };

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
//   "type": "service_account",
//   "project_id": "your-project-id",
//   "private_key_id": "your-private-key-id",
//   "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
//   "client_email": "  "your-client-email",
//   "client_id": "your-client-id",
//   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//   "token_uri": "https://oauth2.googleapis.com/token",
//   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-client-email",
//   "universe_domain": "googleapis.com"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };






