import _ from "lodash"
import { firebaseDB } from "@/common/api"

const usersRef = firebaseDB.database().ref("Users")

const studentModule = {
  state: {},
  getters: {
    getStudentInfo: (state) => (id) => state[id],
    getAllStudentsInfo: (state) => {
      return _.map(state, (value, key) => {
        return {
          ...value,
          id: key,
        }
      })
    },
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
