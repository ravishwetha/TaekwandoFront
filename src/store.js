import Vue from "vue"
import Vuex from "vuex"
import createPersistedState from "vuex-persistedstate"
import lessonStore from "@/modules/lessonStore"
import studentStore from "@/modules/studentStore"
import priceStore from "@/modules/priceStore"

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState({ storage: window.sessionStorage })],
  state: {
    loggedIn: false,
    priceList: {},
  },
  mutations: {
    isLoggedIn(state, { loggedIn }) {
      state.loggedIn = loggedIn
    },
  },
  modules: {
    lessonsModule: lessonStore,
    studentsModule: studentStore,
    priceModule: priceStore,
  },
  actions: {
    login({ commit }) {
      commit("isLoggedIn", { loggedIn: true })
    },
  },
  getters: {
    getLoggedInStatus: (state) => state.loggedIn,
  },
})
