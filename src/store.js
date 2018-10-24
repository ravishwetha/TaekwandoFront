import Vue from "vue"
import Vuex from "vuex"
import firebase from "firebase"
import { firebaseConfig } from "@/common/data"
import { Promise } from "core-js"

const firebaseDB = firebase.initializeApp(firebaseConfig)
const usersRef = firebaseDB.database().ref("Users")

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    students: [],
  },
  mutations: {
    saveStudentData(state, studentData) {
      state.students = studentData
    },
  },
  actions: {
    loadStudentData({ commit, state }) {
        try {
          const usersArray = usersRef.on("value", (snapshot) => snapshot.val())
          commit("saveStudentData", usersArray)
        } catch {
          console.log("users retrieval failed")
        }
      })
    },
  },
})
