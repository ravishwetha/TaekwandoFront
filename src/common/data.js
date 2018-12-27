export const DAYS = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
}

export const DAYS_ENGLISH = {
  SUN: "Sunday",
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
}

export const PRESENT = "PRESENT"
export const ABSENT = "ABSENT"
export const MAKEUP = "MAKEUP"
export const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_FIREBASE_DB_URL,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_SENDER_ID,
}

export const UNLIMITED = "UNLIMITED"

export const CARD = "CARD"
export const CASHNETS = "CASHNETS"
export const REFUNDED = "REFUNDED"

export const ACTIVE = "ACTIVE"
export const TRIAL = "TRIAL"
export const TERMINATED = "TERMINATED"

export const MISCELLEANEOUS = "MISCELLEANEOUS"
export const LESSONS = "LESSONS"
