// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc } from "firebase/firestore";
import { Heatmap } from "../store/HeatmapStore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// export async function getAllClicks(floorplanId: string) {
//     try {
//         // Get a reference to the collection
//         const collectionRef = collection(doc(db, "heatmaps", floorplanId), "booths");
//
//         // Get all documents in the collection
//         const querySnapshot = await getDocs(collectionRef);
//         console.log(querySnapshot);
//
//         let booths = [];
//         querySnapshot.forEach((doc) => {
//             let booth = doc.data();
//             booth.id = doc.id;
//             booths.push(booth);
//         });
//
//         console.log(booths);
//         return booths;
//     } catch (error) {
//         console.log("Error getting documents:", error);
//         throw error;
//     }
// }

export async function getAllClicks(floorplanId: string) {
    const querySnapshot = await getDocs(collection(doc(db, "heatmaps", floorplanId), "booths"));
    const heatmapData = querySnapshot.docs.map<Heatmap>((doc) => ({
        boothId: Number(doc.id),
        clickCount: doc.data().clickCount,
    }));
    console.log(heatmapData);
    return heatmapData as Heatmap[];
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
        console.log("Success update click");
    } catch (error) {
        console.log("Error updating document:", error);
        throw error;
    }
}
