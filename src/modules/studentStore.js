import _ from "lodash"
import moment from "moment"
import { firebaseDB } from "@/common/api"

export const usersRef = firebaseDB.database().ref("Users")

const studentModule = {
  state: {},
  getters: {
    getStudentInfo: (state) => (id) => state[id],
    getAllStudentsInfo: (state) => {
      return _.map(state, (value, key) => {
        return {
          ...value,
          id: key,
          lessons: _.map(value.lessons, (lesson) => lesson),
        }
      })
    },
  },
  mutations: {
    getAllStudentsData(state, studentData) {
      _.merge(state, studentData)
    },
    addNewUser(state, studentData) {
      state[studentData.id] = studentData
    },
  },
  actions: {
    async addUser({ commit }, userData) {
      try {
        const userId = await usersRef.push(userData).key

        commit("addNewUser", { ...userData, id: userId })
      } catch {
        console.log("users insertion failed")
      }
    },
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
    async submitAttendance({ commit }, { userIdsAndPresence, lessonId }) {
      console.log(userIdsAndPresence)
      await Promise.all(
        userIdsAndPresence.map((userIdAndPresence) =>
          usersRef
            .child(userIdAndPresence.userId)
            .child("attendance")
            .push({
              lessonId,
              presence: userIdAndPresence.presence,
              timestamp: moment().toISOString(),
            })
        )
      )
    },
  },
}

export default studentModule
