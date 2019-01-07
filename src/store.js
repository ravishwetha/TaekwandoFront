import Vue from "vue"
import Vuex from "vuex"
import createPersistedState from "vuex-persistedstate"
import lessonStore from "@/modules/lessonStore"
import studentStore from "@/modules/studentStore"
import priceStore from "@/modules/priceStore"

import { loginAPI, resetPasswordAPI } from "@/common/api"
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
    async resetPassword({ commit }, { email, vm }) {
      try {
        await resetPasswordAPI(email)
        vm.$notify({
          title: "Password reset success",
          message:
            "Your password has been reset. Check your email for instructions.",
          type: "success",
        })
      } catch (e) {
        vm.$notify({
          title: "Password reset failed",
          message: e.response.data,
          type: "error",
        })
      }
    },
    async login({ commit }, { username, password, vm, signup }) {
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
          AesJs.utils.hex.fromBytes(encryptedUserNamePassword),
          signup
        )
        sessionStorage.setItem("token", token)
        if (signup) {
          vm.$notify({
            title: "Signup success",
            message: "Signup is successful!",
            type: "Success",
          })
        }
        commit("isLoggedIn", { loggedIn: true })
        vm.$router.push({
          name: "home",
        })
      } catch (e) {
        vm.$notify({
          title: "Login failed",
          message: e.response.data,
          type: "error",
        })
        vm.loggingIn = false
        vm.signingUp = false
      }
    },
  },
  getters: {
    getLoggedInStatus: (state) => state.loggedIn,
  },
})
