import _ from "lodash"
import moment from "moment"
import Vue from "vue"
import store from "@/store"
import {
  firebaseDB,
  tokenPaymentAPI,
  cardRegistrationAPI,
  refundAPI,
} from "@/common/api"
import { CARD, CASHNETS, REFUNDED, TERMINATED, PRESENT } from "@/common/data"
import { lessonsRef } from "./lessonStore"

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
        } else {
          const paymentObjects = _.values(value.payments)
          const sortedAscendingPayment = _.sortBy(paymentObjects, (payment) => {
            return moment(payment.created).unix()
          })
          const lastPayment = _.last(sortedAscendingPayment)
          const lastPaymentDate = moment(lastPayment.created).format(
            "DD-MM-YYYY"
          )
          userData = {
            ...userData,
            lastPayment: lastPaymentDate,
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
    startPayment(state, { userId, lessonId, lastPayment }) {
      Vue.set(state.studentData[userId]["lessons"][lessonId], { lastPayment })
    },
    refundPayment(state, { userId, paymentId }) {
      state.studentData[userId].payments[paymentId].mode = REFUNDED
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
      addLessonToUsers.forEach(({ userId, payload }) => {
        if (state.studentData[userId].lessons == undefined) {
          Vue.set(state.studentData[userId], "lessons", {})
        }
        Vue.set(state.studentData[userId].lessons, lessonId, payload)
      })
    },
    removeLessonFromUser(state, { userId, lessonId }) {
      Vue.delete(state.studentData[userId].lessons, lessonId)
    },
    addPayment(state, { userId, paymentPayload, paymentKey }) {
      if (state.studentData[userId].payments == undefined) {
        Vue.set(state.studentData[userId], "payments", {})
      }
      Vue.set(state.studentData[userId].payments, paymentKey, paymentPayload)
    },
    addCustomer(state, { userId, cardToken }) {
      Vue.set(state.studentData[userId], "customer", cardToken)
    },
  },
  actions: {
    async deleteUser({ commit, state }, { userId }) {
      try {
        usersRef.child(userId).update({
          status: TERMINATED,
          terminatedTime: moment().toISOString(),
        })
        const userData = store.getters.getStudentInfo(userId)
        const lessonIdUserIsIn = _.keys(_.get(userData, "lessons", []))
        if (lessonIdUserIsIn.length > 0) {
          const lessonData = store.getters.getAllLessonData
          const deletionPromises = _.map(lessonIdUserIsIn, (lessonId) => {
            const lessonDetails = lessonData[lessonId]["Users"]
            const deletionKey = _.findKey(lessonDetails, (id) => {
              return userId === id
            })
            return lessonsRef
              .child(lessonId)
              .child("Users")
              .child(deletionKey)
              .remove()
          })
          Promise.all(deletionPromises)
        }
      } catch (e) {
        console.log(e.response.data)
      }
    },

    async registerCard({ commit }, { userId, cardToken, vm }) {
      try {
        const customerObject = await cardRegistrationAPI({ cardToken })
        await usersRef
          .child(userId)
          .child("customer")
          .set(customerObject)
        commit("addCustomer", { userId, customerObject })
        vm.$notify({
          type: "success",
          title: "Registration success",
          message: "Card registered",
        })
      } catch (e) {
        console.log(e.response.data)
        vm.$notify({
          title: "Registration error",
          message: e.response.data,
          type: "error",
        })
      }
    },
    async addLessonCashPayment({ commit }, { paymentData, userId, vm }) {
      try {
        commit("modifyStudentDataLoadingStatus", { status: true })
        const { paymentKey, paymentPayload } = await addCashNetsPayment(
          paymentData,
          userId
        )
        const lessonData = store.getters.getAllLessonData
        const lessonId = _.findKey(lessonData, (lesson) => {
          return _.includes(
            lesson.name,
            _.last(_.initial(paymentData.paymentInfo.type))
          )
        })
        if (lessonId) {
          const entitlement = await usersRef
            .child(userId)
            .child("lessons")
            .child(lessonId)
            .child("entitlement")
            .once("value")
            .then((r) => r.val())
          await usersRef
            .child(userId)
            .child("lessons")
            .child(lessonId)
            .update({
              lastPayment: moment().toISOString(),
              entitlement:
                parseInt(entitlement) +
                parseInt(_.last(paymentData.paymentInfo.type)),
            })
        }
        commit("addPayment", { userId, paymentPayload, paymentKey })
        vm.$notify({
          type: "success",
          title: "Payment success",
          message: "Payment was a success",
        })
        commit("modifyStudentDataLoadingStatus", { status: false })
      } catch (e) {
        commit("modifyStudentDataLoadingStatus", { status: false })
        console.log(e)
        vm.$notify({
          title: "Payment error",
          message: e.response.data,
          type: "error",
        })
      }
    },
    async startPayment({ commit }, { userId, lessonId }) {
      const lastPayment = moment().toISOString()
      await usersRef
        .child(userId)
        .child("lessons")
        .child(lessonId)
        .update({ lastPayment })
      commit("startPayment", { userId, lessonId, lastPayment })
    },
    async refundPayment({ commit }, paymentData) {
      const { mode, id, userId, vm } = paymentData
      vm.$message({ type: "warning", message: "Refunding, please wait!" })
      try {
        if (mode === CASHNETS) {
          await usersRef
            .child(userId)
            .child("payments")
            .child(id)
            .update({ mode: REFUNDED })
        } else if (mode === CARD) {
          const { chargeId } = paymentData
          await refundAPI(chargeId)
        }
        commit("refundPayment", { userId, paymentId: id })
        vm.$notify({
          type: "success",
          title: "Refund success",
          message: "Refund was a success",
        })
      } catch (e) {
        console.log(e)
        vm.$notify({
          title: "Payment error",
          message: e.response.data,
          type: "error",
        })
      }
    },
    async addSinglePayment(
      { commit },
      { type, paymentData, userId, vm, customer }
    ) {
      try {
        commit("modifyStudentDataLoadingStatus", { status: true })
        if (type == CARD) {
          if (customer) {
            const { paymentKey, paymentPayload } = await addCardPaymentCustomer(
              paymentData,
              userId
            )
            commit("addPayment", { userId, paymentPayload, paymentKey })
          } else {
            const {
              paymentKey,
              paymentPayload,
            } = await addCardPaymentNonCustomer(paymentData, userId)
            commit("addPayment", { userId, paymentPayload, paymentKey })
          }
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
        console.log(e.response.data)
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
        console.log(e.response.data)
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
        console.log(e.response.data)
      }
    },
    async submitAttendance(
      { commit },
      { userIdsAndPresence, lessonId, studentsToBeUpdated }
    ) {
      await Promise.all(
        userIdsAndPresence.map(async (userIdAndPresence) => {
          const attendanceToBeUpdated =
            studentsToBeUpdated[userIdAndPresence.userId]
          const entitlementCount = await usersRef
            .child(userIdAndPresence.userId)
            .child("lessons")
            .child(lessonId)
            .child("entitlement")
            .once("value")
            .then((r) => r.val())
          //update entitlement
          if (userIdAndPresence.presence === PRESENT) {
            usersRef
              .child(userIdAndPresence.userId)
              .child("lessons")
              .child(lessonId)
              .update({ entitlement: parseInt(entitlementCount) - 1 })
          } else {
            usersRef
              .child(userIdAndPresence.userId)
              .child("lessons")
              .child(lessonId)
              .update({ entitlement: parseInt(entitlementCount) + 1 })
          }
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

const addCardPaymentNonCustomer = async (paymentData, userId) => {
  const { chargeId, chargeCreated } = await tokenPaymentAPI(paymentData)
  let paymentPayload = {
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

const addCardPaymentCustomer = async (paymentData, userId) => {
  const { chargeId, chargeCreated } = await tokenPaymentAPI({
    ...paymentData,
    customer: true,
  })
  let paymentPayload = {
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
