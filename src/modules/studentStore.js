import _ from "lodash"
import moment from "moment"
import { firebaseDB, tokenPaymentAPI } from "@/common/api"
import Vue from "vue"
import { PRESENT } from "@/common/data"
import { CARD, CASHNETS } from "@/common/data"

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
    removeUser(state, { userId }) {
      state.studentData = _.filter(
        state.studentData,
        (value, key) => key != userId
      )
    },
    addNewUser(state, studentData) {
      Vue.set(state.studentData, studentData.id, studentData)
    },
    editUser(state, studentData) {
      state.studentData[studentData.id] = {
        ...state.studentData[studentData.id],
        ...studentData,
      }
    },
    modifyStudentDataLoadingStatus(state, { status }) {
      state.studentDataLoading = status
    },

    addLessonToUsers(state, { addLessonToUsers, lessonId }) {
      addLessonToUsers.forEach(({ key, userId }) => {
        Vue.set(state.studentData[userId], "lessons", { [key]: lessonId })
      })
    },
    addPayment(state, { userId, paymentPayload, paymentKey }) {
      if (state.studentData[userId].payments == undefined) {
        Vue.set(state.studentData[userId], "payments", {})
      }
      Vue.set(state.studentData[userId].payments, paymentKey, paymentPayload)
    },
  },
  actions: {
    async deleteUser({ commit }, { userId }) {
      try {
        await usersRef.child(userId).remove()
      } catch (e) {
        console.log(e)
      }
    },
    async addSinglePayment({ commit }, { type, paymentData, userId, vm }) {
      try {
        commit("modifyStudentDataLoadingStatus", { status: true })
        if (type == CARD) {
          const { paymentKey, paymentPayload } = await addCardPayment(
            paymentData,
            userId
          )
          commit("addPayment", { userId, paymentPayload, paymentKey })
        } else {
          const { paymentKey, paymentPayload } = await addCashNetsPayment(
            paymentData,
            userId
          )
          commit("addPayment", { userId, paymentPayload, paymentKey })
        }
        vm.$notify({
          type: "success",
          title: "Payment success",
          message: "Payment was a success",
        })
        commit("modifyStudentDataLoadingStatus", { status: false })
      } catch (e) {
        commit("modifyStudentDataLoadingStatus", { status: false })
        vm.$notify({
          title: "Payment error",
          message: e.response.data,
          type: "error",
        })
      }
    },
    async addUser({ commit, dispatch }, userData) {
      try {
        commit("modifyStudentDataLoadingStatus", { status: true })
        const studentData = _.omit(userData, "lessonId")
        const userId = await usersRef.push(studentData).key
        dispatch("addUsersToLesson", {
          lessonId: userData.lessonId,
          userIds: [userId],
        })
        commit("addNewUser", { ...userData, id: userId })
        commit("modifyStudentDataLoadingStatus", { status: false })
      } catch (e) {
        commit("modifyStudentDataLoadingStatus", { status: false })
        console.log(e)
      }
    },
    async updateUser({ commit }, { userData, userId }) {
      try {
        commit("modifyStudentDataLoadingStatus", { status: true })
        await usersRef.child(userId).update(userData)
        commit("editUser", { ...userData, id: userId })
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

const addCardPayment = async (paymentData, userId) => {
  const { chargeId, chargeCreated } = await tokenPaymentAPI(paymentData)
  const paymentPayload = {
    mode: CARD,
    chargeId,
    created: moment.unix(chargeCreated).toISOString(),
    price: paymentData.paymentInfo.price,
    type: paymentData.paymentInfo.type,
    description: paymentData.paymentInfo.description,
  }
  const paymentKey = await usersRef
    .child(userId)
    .child("payments")
    .push(paymentPayload).key
  return { paymentKey, paymentPayload }
}

const addCashNetsPayment = async (paymentData, userId) => {
  const paymentPayload = {
    mode: CASHNETS,
    created: moment().toISOString(),
    price: paymentData.paymentInfo.price,
    type: paymentData.paymentInfo.type,
    description: paymentData.paymentInfo.description,
  }
  const paymentKey = await usersRef
    .child(userId)
    .child("payments")
    .push(paymentPayload).key
  return { paymentKey, paymentPayload }
}

export default studentModule
