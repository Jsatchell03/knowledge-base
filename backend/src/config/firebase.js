// Firebase Admin SDK initialization — exports db (Firestore) and storage
const admin = require("firebase-admin");
const serviceAccount = require("../firestoreServiceAccountKey.json"); // Replace with your path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
