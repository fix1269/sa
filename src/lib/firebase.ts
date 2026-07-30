import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import shopConfig from "@/../shopapp.js";

const app = initializeApp(shopConfig.firebase);
export const db = getFirestore(app);
export default app;
