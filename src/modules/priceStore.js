import Vue from "vue"
import { priceListAPI } from "@/common/api"
import { firebaseDB } from "@/common/api"

export const priceRef = firebaseDB.database().ref("priceList")

const priceModule = {
  state: {
    priceList: {},
  },
  mutations: {
    loadPriceList(state, payload) {
      state.priceList = { ...payload }
    },
    addPriceList(state, { current, newName, payloadPrice }) {
      let priceListObject = state.priceList
      current.forEach((cat) => {
        priceListObject = priceListObject[cat]
      })
      Vue.set(priceListObject, newName, payloadPrice)
    },
    updatePriceList(state, { current, newName, newPrice }) {
      //TODO:
      let priceRefToBeUpdated = state.priceList
      _.initial(current).forEach((ref) => {
        priceRefToBeUpdated = priceRefToBeUpdated[ref]
      })
      Vue.delete(priceRefToBeUpdated, _.last(current))
      Vue.set(priceRefToBeUpdated, newName, newPrice)
    },
  },
  actions: {
    async loadPriceList({ commit }) {
      const data = await priceListAPI()
      commit("loadPriceList", data)
    },
    async updatePriceList({ commit }, { current, newName, newPrice }) {
      let priceRefToBeUpdated = priceRef
      _.initial(current).forEach((ref) => {
        priceRefToBeUpdated = priceRefToBeUpdated.child(ref)
      })
      const priceRefToBeRemoved = priceRefToBeUpdated.child(_.last(current))
      await priceRefToBeRemoved.remove()
      await priceRefToBeUpdated.update({ [newName]: newPrice })
      commit("updatePriceList", { current, newName, newPrice })
    },
    addPriceList({ commit }, { current, newName, newPrice }) {
      let priceRefToBeUpdated = priceRef
      current.forEach((ref) => {
        priceRefToBeUpdated = priceRefToBeUpdated.child(ref)
      })
      let payloadPrice
      if (newPrice === "") {
        // priceRefToBeUpdated.update({ [newName]: -1 })
        payloadPrice = {}
      } else {
        priceRefToBeUpdated.update({ [newName]: newPrice })
        payloadPrice = newPrice
      }
      // priceRefToBeUpdated.update(payloadPrice)
      commit("addPriceList", { current, newName, payloadPrice })
    },
  },
  getters: {
    getPriceList: (state) => state.priceList,
  },
}

export default priceModule
