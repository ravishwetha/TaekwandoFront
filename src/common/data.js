export const DAYS = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

export const PRESENT = "PRESENT"
export const ABSENT = "ABSENT"
export const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE,
  authDomain: "taekwandobackend-d1edf.firebaseapp.com",
  databaseURL: "https://taekwandobackend-d1edf.firebaseio.com",
  projectId: "taekwandobackend-d1edf",
  storageBucket: "taekwandobackend-d1edf.appspot.com",
  messagingSenderId: "1011970784530",
}

export const CARD = "CARD"
export const CASHNETS = "CASHNETS"

export const ACTIVE = "ACTIVE"
export const INACTIVE = "INACTIVE"
export const TERMINATED = "TERMINATED"
