import firebase from "firebase"
import { firebaseConfig } from "@/common/data"

export const firebaseDB = firebase.initializeApp(firebaseConfig)
