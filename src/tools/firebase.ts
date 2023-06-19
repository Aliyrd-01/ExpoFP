import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc } from "firebase/firestore";
import { Heatmap } from "../store/HeatmapStore";
import logger from "./logger";

const firebaseConfig = {
    apiKey: "AIzaSyCDhFIYzbNyRJvuDe10i99RJu1Mqu0Z9cw",
    authDomain: "fp-heatmap.firebaseapp.com",
    projectId: "fp-heatmap",
    storageBucket: "fp-heatmap.appspot.com",
    messagingSenderId: "979565520977",
    appId: "1:979565520977:web:c06e29af8b786adfbaf070",
    measurementId: "G-T1ZRWL3BK6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getAllClicks(floorplanId: string) {
    try {
        const querySnapshot = await getDocs(collection(doc(db, "heatmaps", floorplanId), "booths"));
        logger.log("Heatmap data loaded");
        return querySnapshot.docs.map<Heatmap>((doc) => ({
            boothId: Number(doc.id),
            clickCount: doc.data().clickCount,
        }));
    } catch (e) {}
}

export async function recordClick(floorplanId: string, boothId: number) {
    try {
        // Get a reference to the document
        const floorplanDocRef = doc(db, "heatmaps", floorplanId);
        const boothDocRef = doc(collection(floorplanDocRef, "booths"), boothId.toString());

        // Check if document exists
        const docSnap = await getDoc(boothDocRef);

        if (docSnap.exists()) {
            // If document exists, increment the click count
            await setDoc(boothDocRef, { clickCount: docSnap.data().clickCount + 1 }, { merge: true });
        } else {
            // If document does not exist, initialize it with a click count of 1
            await setDoc(boothDocRef, { clickCount: 1 });
        }
        logger.log("Success update click");
    } catch (error) {}
}
