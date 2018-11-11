import _ from "lodash"
import moment from "moment"
import { firebaseDB } from "@/common/api"
import Vue from "vue"
import { PRESENT } from "@/common/data"

export const usersRef = firebaseDB.database().ref("Users")

const studentModule = {
  state: {
    studentData: {},
    studentDataLoading: false,
  },
  getters: {
    getStudentInfo: (state) => (id) => state.studentData[id],
    getAllStudentsInfo: (state) => {
      return _.map(state.studentData, (value, key) => {
        let userData = {
          ...value,
          userId: key,
        }
        if (!value.payments) {
          userData = {
            ...userData,
            lastPayment: "Have not made any payments",
          }
        }
        if (!value.attendance) {
          return {
            ...userData,
            presentCount: 0,
          }
        } else {
          return {
            ...userData,
            presentCount: _.keys(
              _.filter(
                value.attendance,
                (attendance) => attendance.presence === PRESENT
              )
            ).length,
          }
        }
      })
    },
    getStudentDataLoading: (state) => state.studentDataLoading,
  },
  mutations: {
    getAllStudentsData(state, studentData) {
      state.studentData = studentData
    },
    addNewUser(state, studentData) {
      Vue.set(state.studentData, studentData.id, studentData)
    },
    modifyStudentDataLoadingStatus(state, { status }) {
      state.studentDataLoading = status
    },

    addLessonToUsers(state, { addLessonToUsers, lessonId }) {
      addLessonToUsers.forEach(({ key, userId }) => {
        Vue.set(state.studentData[userId], "lessons", { [key]: lessonId })
      })
    },
  },
  actions: {
    async addUser({ commit }, userData) {
      try {
        commit("modifyStudentDataLoadingStatus", { status: true })
        const userId = await usersRef.push(userData).key

        commit("addNewUser", { ...userData, id: userId })
        commit("modifyStudentDataLoadingStatus", { status: false })
      } catch (e) {
        commit("modifyStudentDataLoadingStatus", { status: false })
        console.log(e)
      }
    },
    async loadStudentsData({ commit }) {
      try {
        commit("modifyStudentDataLoadingStatus", { status: true })

        const usersObject = await usersRef
          .once("value")
          .then((snapshot) => snapshot.val())
        commit("getAllStudentsData", usersObject)
        commit("modifyStudentDataLoadingStatus", { status: false })
      } catch (e) {
        commit("modifyStudentDataLoadingStatus", { status: false })
        console.log(e)
      }
    },
    async submitAttendance(
      { commit },
      { userIdsAndPresence, lessonId, studentsToBeUpdated }
    ) {
      await Promise.all(
        userIdsAndPresence.map((userIdAndPresence) => {
          const attendanceToBeUpdated =
            studentsToBeUpdated[userIdAndPresence.userId]
          if (attendanceToBeUpdated) {
            usersRef
              .child(userIdAndPresence.userId)
              .child("attendance")
              .child(attendanceToBeUpdated)
              .update({
                lessonId,
                presence: userIdAndPresence.presence,
                timestamp: moment().toISOString(),
              })
          } else {
            usersRef
              .child(userIdAndPresence.userId)
              .child("attendance")
              .push({
                lessonId,
                presence: userIdAndPresence.presence,
                timestamp: moment().toISOString(),
              })
          }
        })
      )
    },
  },
}

export default studentModule
