import Vue from "vue"
import Vuex from "vuex"
import createPersistedState from "vuex-persistedstate"
import lessonStore from "@/modules/lessonStore"
import studentStore from "@/modules/studentStore"
import { priceListAPI } from "@/common/api"

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
    loadPriceList(state, payload) {
      state.priceList = { ...payload }
    },
  },
  modules: {
    lessonsModule: lessonStore,
    studentsModule: studentStore,
  },
  actions: {
    login({ commit }) {
      commit("isLoggedIn", { loggedIn: true })
    },
    async loadPriceList({ commit }) {
      const data = await priceListAPI()
      commit("loadPriceList", data)
    },
  },
  getters: {
    getLoggedInStatus: (state) => state.loggedIn,
    getPriceList: (state) => state.priceList,
  },
})
