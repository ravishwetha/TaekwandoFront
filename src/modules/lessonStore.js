import _ from "lodash"
import { firebaseDB } from "@/common/api"
import { usersRef } from "@/modules/studentStore"
const lessonsRef = firebaseDB.database().ref("Lessons")

const lessonsModule = {
  state: {
    lessons: {},
  },
  mutations: {
    loadAllLessonsData(state, lessonData) {
      state.lessons = lessonData
    },
    createNewLesson(state, lessonData) {
      state.lessons[lessonData.id] = lessonData
    },
    addUserToLesson(state, { userId, lessonId }) {},
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

    async addUsersToLesson({ commit }, { userIds, lessonId }) {
      const lessonPromises = userIds.map((userId) =>
        lessonsRef
          .child(lessonId)
          .child("users")
          .push(userId)
          .once("value")
          .then((snapshot) => snapshot.val())
      )
      const userPromises = userIds.map((userId) =>
        usersRef
          .child(userId)
          .child("lessons")
          .push(lessonId)
          .once("value")
          .then((snapshot) => snapshot.val())
      )
      await Promise.all(lessonPromises.concat(userPromises))
      commit("addUserToLesson", { userIds, lessonId })
    },
  },
  getters: {
    getLessonData: (state) => {
      return _.map(state.lessons, (value, key) => {
        return {
          ...value,
          id: key,
        }
      })
    },
  },
}

export default lessonsModule
