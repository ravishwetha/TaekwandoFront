import _ from "lodash"
import { firebaseDB } from "@/common/api"
import { usersRef } from "@/modules/studentStore"
import store from "@/store"
import Vue from "vue"
import moment from "moment"
import {
  getDayTimeslotToObject,
  getDayTimeslotToArray,
} from "@/common/dateUtils"
export const lessonsRef = firebaseDB.database().ref("Lessons")

const lessonsModule = {
  state: {
    lessons: {},
  },
  mutations: {
    loadAllLessonsData(state, lessonData) {
      state.lessons = lessonData
    },
    createNewLesson(state, lessonData) {
      Vue.set(state.lessons, lessonData.id, lessonData)
    },
    editLesson(state, lessonData) {
      state.lessons[lessonData] = lessonData
    },
    addUsersToLesson(state, { addUsersToLesson, lessonId }) {
      addUsersToLesson.forEach(({ key, userId }) => {
        if (state.lessons[lessonId].users === undefined) {
          Vue.set(state.lessons[lessonId], "Users", {})
        }
        Vue.set(state.lessons[lessonId]["Users"], key, userId)
      })
    },
    removeUserFromLesson(state, { lessonId, lessonUserIdKey }) {
      Vue.delete(state.lessons[lessonId]["Users"], lessonUserIdKey)
    },
  },
  actions: {
    async loadLessonsData({ commit }) {
      try {
        const lessonsObject = await lessonsRef
          .once("value")
          .then((snapshot) => snapshot.val())
        commit("loadAllLessonsData", lessonsObject)
      } catch {
        console.log("lesson retrieval failed")
      }
    },
    async createNewLesson({ commit }, formData) {
      const newLessonId = await lessonsRef.push(formData).key
      commit("createNewLesson", { ...formData, id: newLessonId })
    },
    async deleteLesson({ commit }, { lessonId }) {
      const lessonInfo = store.getters.getLessonData(lessonId)
      const studentIdsInLesson = _.values(lessonInfo["Users"])
      const userLessonDeletionPromises = studentIdsInLesson.map((userId) =>
        usersRef
          .child(userId)
          .child("lessons")
          .child(lessonId)
          .remove()
      )
      await Promise.all([
        ...userLessonDeletionPromises,
        lessonsRef.child(lessonId).remove(),
      ])
    },

    async editLesson({ commit }, { formData, lessonId }) {
      await lessonsRef.child(lessonId).update(formData)
      commit("editLesson", { ...formData, id: lessonId })
    },

    async swapLessonForUser(
      { dispatch },
      { oldlessonId, newLessonId, userIdSessions }
    ) {
      const userId = _.get(userIdSessions, "userId")
      await dispatch("removeUserFromLesson", {
        lessonId: oldlessonId,
        userId,
      })
      await dispatch("addUsersToLesson", {
        lessonId: newLessonId,
        userIdsSessions: [userIdSessions],
      })
      await usersRef
        .child(userId)
        .child("transfers")
        .push({
          timestamp: moment().toISOString(),
          from: oldlessonId,
          to: newLessonId,
        })
    },
    async removeUserFromLesson({ commit }, { lessonId, userId }) {
      const allLessonData = store.getters.getAllLessonData
      const lesson = _.get(allLessonData, lessonId)
      let lessonUserIdKey
      _.forEach(_.get(lesson, "Users"), (id, key) => {
        if (userId === id) {
          lessonUserIdKey = key
        }
      })
      await lessonsRef
        .child(lessonId)
        .child("Users")
        .child(lessonUserIdKey)
        .remove()
      await usersRef
        .child(userId)
        .child("lessons")
        .child(lessonId)
        .remove()
      commit("removeUserFromLesson", {
        lessonId,
        lessonUserIdKey,
      })
      commit("removeLessonFromUser", {
        userId,
        lessonId,
      })
    },
    async addUsersToLesson({ commit }, { userIdsSessions, lessonId }) {
      const lessonPromises = userIdsSessions.map(({ userId }) => {
        const key = lessonsRef
          .child(lessonId)
          .child("Users")
          .push(userId).key
        return { key, userId }
      })
      const userPromises = userIdsSessions.map(
        ({ userId, sessions, timeslot, day }) => {
          const payload = {
            entitlement: sessions,
            paymentPlan: sessions,
            timeslot,
            day,
          }
          usersRef
            .child(userId)
            .child("lessons")
            .child(lessonId)
            .set(payload)
          return {
            userId,
            payload,
          }
        }
      )
      const addUsersToLesson = await Promise.all(lessonPromises)
      const addLessonToUsers = await Promise.all(userPromises)
      commit("addUsersToLesson", { addUsersToLesson, lessonId })
      commit("addLessonToUsers", { addLessonToUsers, lessonId })
    },
  },
  getters: {
    getAllLessonData: (state) => state.lessons,
    getLessonData: (state) => (id) => state.lessons[id],
    getLessonDayTimeslotsKeyedByDay: (state) => (id) => {
      const lessonDayTimeslot = state.lessons[id].dayTimeslots
      return getDayTimeslotToObject(lessonDayTimeslot)
    },
    getLessonDayTimeslots: (state) => (id) => {
      const lessonDayTimeslot = state.lessons[id].dayTimeslots
      return getDayTimeslotToArray(lessonDayTimeslot)
    },
  },
}

export default lessonsModule
