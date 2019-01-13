export const DAYS = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
}

export const NUMBER_DAYS = {
  0: "SUN",
  1: "MON",
  2: "TUE",
  3: "WED",
  4: "THU",
  5: "FRI",
  6: "SAT",
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
export const ONCE = "ONCE"

export const CARD = "CARD"
export const CASHNETS = "CASHNETS"
export const REFUNDED = "REFUNDED"

export const ACTIVE = "ACTIVE"
export const TRIAL = "TRIAL"
export const TERMINATED = "TERMINATED"

export const MISCELLEANEOUS = "MISCELLEANEOUS"
export const LESSONS = "LESSONS"

export const GRADING_SORTING_ORDER = [
  "F3",
  "F1-3",
  "F1-2",
  "WHITE_3_STARS",
  "WHITE_YELLOW_BELT",
  "YELLOW_BELT",
  "YELLOW_GREEN_BELT",
  "GREEN_BELT",
  "GREEN_BLUE_BELT",
  "BLUE_BELT",
  "BLUE_RED_BELT",
  "RED_BELT",
  "RED_BLACK_BELT",
  "POOM_1",
  "POOM_2",
  // "RED_BLACK (P-Pass)",
  // "Poom/Dan_1 ",
  // "Poom/Dan_1 (P-Pass)",
  // "Poom/Dan_2",
  // "Poom/Dan_2 (P-Pass)",
  // "Poom/Dan_3",
  // "Poom/Dan_3 (P-Pass)",
  // "Poom/Dan_4",
  // "Poom/Dan_4 (P-Pass)",
]
