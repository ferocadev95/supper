import { initFirestore } from "@auth/firebase-adapter";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

// AuthJS adapter
const firestore = initFirestore({
    credential: cert(serviceAccount),
});

const adminDB = getFirestore();
export { adminDB, firestore };
