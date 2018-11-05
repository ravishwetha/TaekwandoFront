import _ from "lodash"
import { firebaseDB } from "@/common/api"
const lessonsRef = firebaseDB.database().ref("Lessons")

const lessonsModule = {
  state: {},
  mutations: {
    loadAllLessonsData(state, lessonData) {
      _.merge(state, lessonData)
    },
    createNewLesson(state, lessonData) {
      state[lessonData.id] = lessonData
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
  },
  getters: {
    getLessonData: (state) => {
      return _.map(state, (value, key) => {
        return {
          ...value,
          id: key,
        }
      })
    },
  },
}

export default lessonsModule
