import _ from "lodash"
import moment from "moment"
import Vue from "vue"
import store from "@/store"
import {
  firebaseDB,
  tokenPaymentAPI,
  cardRegistrationAPI,
  refundAPI,
  deleteCustomerAPI,
  ReceiptGeneratorAPI,
} from "@/common/api"
import {
  MAKEUP,
  CARD,
  CASHNETS,
  REFUNDED,
  TERMINATED,
  PRESENT,
  ABSENT,
} from "@/common/data"
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
                (attendance) =>
                  attendance.presence === PRESENT ||
                  attendance.presence === MAKEUP
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
    updateExpectPaymentDate(state, { userId, lessonId, expectPayment, price }) {
      const existingExpectPayment =
        state.studentData[userId]["lessons"][lessonId]["expectPayment"]
      const existingPrice =
        state.studentData[userId]["lessons"][lessonId]["price"]
      if (existingExpectPayment === undefined) {
        Vue.set(
          state.studentData[userId]["lessons"][lessonId],
          "expectPayment",
          ""
        )
      }
      if (existingPrice === undefined) {
        Vue.set(state.studentData[userId]["lessons"][lessonId], "price", "")
      }

      state.studentData[userId]["lessons"][lessonId][
        "expectPayment"
      ] = expectPayment
      state.studentData[userId]["lessons"][lessonId]["price"] = price
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
    addPayment(state, { userId, paymentKeyPaymentPayload }) {
      _.forEach(paymentKeyPaymentPayload, ({ paymentKey, paymentPayload }) => {
        if (state.studentData[userId].payments == undefined) {
          Vue.set(state.studentData[userId], "payments", {})
        }
        Vue.set(state.studentData[userId].payments, paymentKey, paymentPayload)
      })
    },
    addCustomer(state, { userId, customerObject }) {
      Vue.set(state.studentData[userId], "customer", customerObject)
    },
    removeCustomer(state, { userId }) {
      Vue.delete(state.studentData[userId], "customer")
    },
    deleteAttendanceRecord(state, { userId, attendanceId }) {
      Vue.delete(state.studentData[userId].attendance, attendanceId)
    },
    autoDeductionStatus(state, { userId, autoDeduction }) {
      Vue.set(state.studentData[userId], "autoDeduction", autoDeduction)
    },
    updateNextPaymentDate(state, { userId, lessonId, payload }) {
      _.forEach(payload, (value, key) => {
        Vue.set(state.studentData[userId]["lessons"][lessonId], key, value)
      })
    },
  },
  actions: {
    async deleteUser({ commit }, { userId }) {
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
          const deleteUserLesson = usersRef
            .child(userId)
            .child("lessons")
            .remove()
          Promise.all([...deletionPromises, deleteUserLesson])
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
    async unregisterCard({ commit }, { userId }) {
      const userCustomerId = store.getters.getStudentInfo(userId)["customer"]
        .customerId
      await usersRef
        .child(userId)
        .child("customer")
        .remove()
      await deleteCustomerAPI(userCustomerId)
      commit("removeCustomer", { userId })
    },
    async autoDeductionStatus({ commit }, { userId, autoDeduction }) {
      await usersRef.child(userId).update({ autoDeduction })
      commit("autoDeductionStatus", { userId, autoDeduction })
    },
    async addCashPayment({ commit }, { paymentItems, userId, vm }) {
      try {
        commit("modifyStudentDataLoadingStatus", { status: true })
        const paymentKeyPaymentPayload = await addCashNetsPayment(
          paymentItems,
          userId
        )
        ReceiptGeneratorAPI(paymentItems, userId, CASHNETS)
        paymentItems.forEach(async ({ paymentData }) => {
          const lessonData = store.getters.getAllLessonData
          const lessonId = _.findKey(lessonData, (lesson) => {
            return _.includes(lesson.name, paymentData.paymentInfo.type[1])
          })
          if (lessonId) {
            const entitlement = await usersRef
              .child(userId)
              .child("lessons")
              .child(lessonId)
              .child("entitlement")
              .once("value")
              .then((r) => r.val())
            const payload = {
              lastPayment: moment().toISOString(),
              entitlement:
                parseInt(entitlement) +
                parseInt(_.last(paymentData.paymentInfo.type)),
              expectPayment: moment()
                .add(_.last(paymentData.paymentInfo.type), "weeks")
                .toISOString(),
              messageSent: false,
            }
            await usersRef
              .child(userId)
              .child("lessons")
              .child(lessonId)
              .update(payload)
            commit("updateNextPaymentDate", { userId, lessonId, payload })
          }
        })

        commit("addPayment", { userId, paymentKeyPaymentPayload })
        vm.$notify({
          type: "success",
          title: "Payment success",
          message:
            "Payment was a success, please wait while receipt is downloading",
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
    async addCardPayment(
      { commit },
      { paymentItems, vm, userId, customer, paymentToken, userEmail }
    ) {
      try {
        commit("modifyStudentDataLoadingStatus", { status: true })
        if (customer) {
          const paymentKeyPaymentPayload = await addCardPaymentCustomer(
            paymentItems,
            userId,
            paymentToken,
            userEmail
          )
          commit("addPayment", { userId, paymentKeyPaymentPayload })
        } else {
          const paymentKeyPaymentPayload = await addCardPaymentNonCustomer(
            paymentItems,
            userId,
            paymentToken,
            userEmail
          )
          commit("addPayment", { userId, paymentKeyPaymentPayload })
        }
        ReceiptGeneratorAPI(paymentItems, userId, CARD)
        paymentItems.forEach(async ({ paymentData }) => {
          //TODO: DOES NOT WORK FOR UNLIMITED AND ONCE?
          const lessonData = store.getters.getAllLessonData
          const lessonId = _.findKey(lessonData, (lesson) => {
            return _.includes(lesson.name, paymentData.paymentInfo.type[1])
          })
          if (lessonId) {
            const entitlement = await usersRef
              .child(userId)
              .child("lessons")
              .child(lessonId)
              .child("entitlement")
              .once("value")
              .then((r) => r.val())
            const payload = {
              lastPayment: moment().toISOString(),
              expectPayment: moment()
                .add(_.last(paymentData.paymentInfo.type), "weeks")
                .toISOString(),
              entitlement:
                parseInt(entitlement) +
                parseInt(_.last(paymentData.paymentInfo.type)),
            }
            await usersRef
              .child(userId)
              .child("lessons")
              .child(lessonId)
              .update(payload)
            commit("updateNextPaymentDate", { userId, lessonId, payload })
          }
        })
        vm.$notify({
          type: "success",
          title: "Payment success",
          message:
            "Payment was a success, please wait while receipt is downloading",
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
        if (mode === CARD) {
          await refundAPI(paymentData)
        }
        await usersRef
          .child(userId)
          .child("payments")
          .child(id)
          .update({ mode: REFUNDED })
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

    async updateExpectPaymentDateAndPrice(
      { commit },
      updateExpectPaymentPayload
    ) {
      const {
        userId,
        lessonId,
        expectPayment,
        price,
      } = updateExpectPaymentPayload
      await usersRef
        .child(userId)
        .child("lessons")
        .child(lessonId)
        .update({ expectPayment, price })
      commit("updateExpectPaymentDate", updateExpectPaymentPayload)
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
    //TODO: MOVE THIS TO THE SAME
    async deleteAttendanceRecord({ commit }, { userId, attendanceId }) {
      usersRef
        .child(userId)
        .child("attendance")
        .child(attendanceId)
        .remove()
      commit("deleteAttendanceRecord", { userId, attendanceId })
    },
    async deleteMakeupAttendance({ commit }, { userId, attendanceId }) {
      usersRef
        .child(userId)
        .child("attendance")
        .child(attendanceId)
        .remove()
      commit("deleteAttendanceRecord", { userId, attendanceId })
    },
    async submitAttendance(
      { dispatch },
      { userIdsAndPresence, lessonId, studentsToBeUpdated, vm }
    ) {
      vm.isSubmitting = true
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
          if (
            userIdAndPresence.presence === PRESENT ||
            userIdAndPresence.presence === MAKEUP
          ) {
            usersRef
              .child(userIdAndPresence.userId)
              .child("lessons")
              .child(lessonId)
              .update({ entitlement: parseInt(entitlementCount) - 1 })
          }
          if (attendanceToBeUpdated) {
            usersRef
              .child(userIdAndPresence.userId)
              .child("attendance")
              .child(attendanceToBeUpdated.attendanceId)
              .update({
                lessonId,
                presence: userIdAndPresence.presence,
                timestamp: moment().toISOString(),
                modifiedBy: store.getters.getUserEmail,
                description: userIdAndPresence.description
                  ? userIdAndPresence.description
                  : "",
              })
            if (
              userIdAndPresence.presence === ABSENT &&
              attendanceToBeUpdated.previous === PRESENT
            ) {
              usersRef
                .child(userIdAndPresence.userId)
                .child("lessons")
                .child(lessonId)
                .update({ entitlement: parseInt(entitlementCount) + 1 })
            }
          } else {
            usersRef
              .child(userIdAndPresence.userId)
              .child("attendance")
              .push({
                lessonId,
                presence: userIdAndPresence.presence,
                timestamp: moment().toISOString(),
                timeslot: userIdAndPresence.timeslot,
                dateOfLesson: userIdAndPresence.dateOfLesson,
                takenBy: store.getters.getUserEmail,
                description: userIdAndPresence.description
                  ? userIdAndPresence.description
                  : "",
              })
          }
        })
      )
      await dispatch("loadStudentsData")
      vm.$message({
        message: "Attendance has been taken",
        type: "success",
      })
      vm.isSubmitting = false
    },
  },
}

const addCardPaymentNonCustomer = async (
  paymentInfo,
  userId,
  token,
  userEmail
) => {
  const { chargeId, chargeCreated } = await tokenPaymentAPI(
    paymentInfo,
    token,
    false,
    userEmail,
    userId
  )
  return await Promise.all(
    paymentInfo.map(async ({ paymentData }) => {
      let paymentPayload = {
        mode: CARD,
        chargeId,
        created: moment.unix(chargeCreated).toISOString(),
        price: paymentData.paymentInfo.price,
        type: paymentData.paymentInfo.type,
        description: paymentData.paymentInfo.description,
        takenBy: store.getters.getUserEmail,
      }
      const paymentKey = await usersRef
        .child(userId)
        .child("payments")
        .push(paymentPayload).key
      return { paymentKey, paymentPayload }
    })
  )
}

const addCardPaymentCustomer = async (
  paymentInfo,
  userId,
  paymentToken,
  userEmail
) => {
  const { chargeId, chargeCreated } = await tokenPaymentAPI(
    paymentInfo,
    paymentToken,
    true,
    userEmail,
    userId
  )
  return await Promise.all(
    paymentInfo.map(async ({ paymentData }) => {
      let paymentPayload = {
        mode: CARD,
        chargeId,
        created: moment.unix(chargeCreated).toISOString(),
        price: paymentData.paymentInfo.price,
        type: paymentData.paymentInfo.type,
        description: paymentData.paymentInfo.description,
        takenBy: store.getters.getUserEmail,
      }
      const paymentKey = await usersRef
        .child(userId)
        .child("payments")
        .push(paymentPayload).key
      return { paymentKey, paymentPayload }
    })
  )
}

const addCashNetsPayment = async (paymentItems, userId) => {
  return await Promise.all(
    paymentItems.map(async ({ paymentData }) => {
      const paymentPayload = {
        mode: CASHNETS,
        created: moment().toISOString(),
        price: paymentData.paymentInfo.price,
        type: paymentData.paymentInfo.type,
        description: paymentData.paymentInfo.description,
        takenBy: store.getters.getUserEmail,
      }
      const paymentKey = await usersRef
        .child(userId)
        .child("payments")
        .push(paymentPayload).key
      return { paymentKey, paymentPayload }
    })
  )
}

export default studentModule
