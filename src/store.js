import Vue from "vue"
import Vuex from "vuex"
import createPersistedState from "vuex-persistedstate"
import lessonStore from "@/modules/lessonStore"
import studentStore from "@/modules/studentStore"
import priceStore from "@/modules/priceStore"

import { loginAPI } from "@/common/api"
import AesJs from "aes-js"

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
    async login({ commit }, { username, password }) {
      const keyString = process.env.VUE_APP_AES_ENCRYPTION_KEY
      const key = keyString.split(",").map((digit) => parseInt(digit))
      const aesEncryptor = new AesJs.ModeOfOperation.ctr(key)
      const userNamePasswordString = JSON.stringify({ username, password })
      const userNamePasswordAsBytes = AesJs.utils.utf8.toBytes(
        userNamePasswordString
      )
      const encryptedUserNamePassword = aesEncryptor.encrypt(
        userNamePasswordAsBytes
      )
      try {
        const token = await loginAPI(
          AesJs.utils.hex.fromBytes(encryptedUserNamePassword)
        )
        sessionStorage.setItem("token", token)
        commit("isLoggedIn", { loggedIn: true })
      } catch (e) {
        console.log(e.response.message)
        throw e
      }
    },
  },
  getters: {
    getLoggedInStatus: (state) => state.loggedIn,
  },
})
