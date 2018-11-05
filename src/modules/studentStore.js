import _ from "lodash"
import { firebaseDB } from "@/common/api"

const usersRef = firebaseDB.database().ref("Users")

const studentModule = {
  state: {},
  getters: {
    getStudentInfo: (state) => (id) => state[id],
  },
  mutations: {
    getAllStudentsData(state, studentData) {
      _.merge(state, studentData)
    },
  },
  actions: {
    async loadStudentsData({ commit }) {
      try {
        const usersObject = await usersRef
          .once("value")
          .then((snapshot) => snapshot.val())
        commit("getAllStudentsData", usersObject)
      } catch {
        console.log("users retrieval failed")
      }
    },
  },
}

export default studentModule
