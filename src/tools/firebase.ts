import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc } from "firebase/firestore";
import { HeatmapItem } from "../store/HeatmapStore";
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
        const boothsSnapshotPromise = getDocs(collection(doc(db, "heatmaps", floorplanId), "booths"));
        const exhibitorsSnapshotPromise = getDocs(collection(doc(db, "heatmaps", floorplanId), "exhibitors"));

        const [boothsSnapshot, exhibitorsSnapshot] = await Promise.all([boothsSnapshotPromise, exhibitorsSnapshotPromise]);

        const booths = boothsSnapshot.docs.map<HeatmapItem>((doc) => ({
            id: Number(doc.id),
            clickCount: doc.data().clickCount,
        }));

        const exhibitors = exhibitorsSnapshot.docs.map<HeatmapItem>((doc) => ({
            id: Number(doc.id),
            clickCount: doc.data().clickCount,
        }));

        return { booths, exhibitors };
    } catch (e) {
        logger.error(e);
    }
}

export async function recordClick(floorplanId: string, boothId: number, type: "booths" | "exhibitors") {
    try {
        const floorplanDocRef = doc(db, "heatmaps", floorplanId);
        const docRef = doc(collection(floorplanDocRef, type), boothId.toString());

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            await setDoc(docRef, { clickCount: docSnap.data().clickCount + 1 }, { merge: true });
        } else {
            await setDoc(docRef, { clickCount: 1 });
        }
        logger.log("Success update click");
    } catch (e) {
        logger.error(e);
    }
}
