// Firebase Admin SDK initialization — exports db (Firestore) and bucket (Cloud Storage)
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("../firestoreServiceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const bucket = getStorage().bucket("knowledge-base-user-uploaded-files");

export default db;
export { bucket };
