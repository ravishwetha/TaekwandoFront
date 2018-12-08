import _ from "lodash"
import { firebaseDB } from "@/common/api"
import { usersRef } from "@/modules/studentStore"
import Vue from "vue"
import moment from "moment"
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
    addUsersToLesson(state, { addUsersToLesson, lessonId }) {
      addUsersToLesson.forEach(({ key, userId }) => {
        if (state.lessons[lessonId].users === undefined) {
          Vue.set(state.studentData[lessonId], "users", {})
        }
        Vue.set(state.lessons[lessonId].users, key, userId)
      })
    },
    removeUserFromLesson(state, { lessonId, lessonUserIdKey }) {
      Vue.delete(state.lessons[lessonId].users, lessonUserIdKey) //NEED TO FIX
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

    async swapLessonForUser(
      { dispatch },
      {
        userLessonIdToBeSwappedKey,
        oldlessonId,
        newLessonId,
        userId,
        lessonUserIdKey,
      }
    ) {
      await dispatch("removeUserFromLesson", {
        userLessonIdToBeDeletedKey: userLessonIdToBeSwappedKey,
        lessonId: oldlessonId,
        userId,
        lessonUserIdKey,
      })
      await dispatch("addUsersToLesson", {
        lessonId: newLessonId,
        userIds: [userId],
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
    async removeUserFromLesson(
      { commit },
      { userLessonIdToBeDeletedKey, lessonId, userId, lessonUserIdKey }
    ) {
      await lessonsRef
        .child(lessonId)
        .child("users")
        .child(lessonUserIdKey)
        .remove()
      await usersRef
        .child(userId)
        .child("lessons")
        .child(userLessonIdToBeDeletedKey)
        .remove()
      commit("removeUserFromLesson", {
        lessonId,
        lessonUserIdKey,
      })
      commit("removeLessonFromUser", {
        userId,
        userLessonIdToBeDeletedKey,
      })
    },
    async addUsersToLesson({ commit }, { userIds, lessonId }) {
      const lessonPromises = userIds.map((userId) => {
        const key = lessonsRef
          .child(lessonId)
          .child("users")
          .push(userId).key
        return { key, userId }
      })
      const userPromises = userIds.map((userId) => {
        const key = usersRef
          .child(userId)
          .child("lessons")
          .push(lessonId).key
        return { key, userId }
      })
      const addUsersToLesson = await Promise.all(lessonPromises)
      const addLessonToUsers = await Promise.all(userPromises)
      commit("addUsersToLesson", { addUsersToLesson, lessonId })
      commit("addLessonToUsers", { addLessonToUsers, lessonId })
    },
  },
  getters: {
    getAllLessonData: (state) => {
      return _.map(state.lessons, (value, key) => {
        return {
          ...value,
          id: key,
        }
      })
    },
    getLessonData: (state) => (id) => state.lessons[id],
  },
}

export default lessonsModule
