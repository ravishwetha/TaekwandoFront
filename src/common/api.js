import Axios from "axios"
import firebase from "firebase"
import { firebaseConfig } from "@/common/data"

export const firebaseDB = firebase.initializeApp(firebaseConfig)

export const axiosConfig = () => {
  return Axios.create({
    baseURL: process.env.VUE_APP_API,
  })
}

export const loginAPI = async ({ username, password }) => {
  const api = await axiosConfig()
  return api
    .get("/login", {
      params: {
        username,
        password,
      },
    })
    .then((r) => r.data)
}

export const emailAPI = async ({ studentData, messageText }) => {
  const api = await axiosConfig()
  return api
    .post("/email", {
      studentData,
      messageText,
    })
    .then((r) => r.data)
}

export const smsAPI = async ({ studentData, messageText }) => {
  const api = await axiosConfig()
  return api
    .post("/sms", {
      studentData,
      messageText,
    })
    .then((r) => r.data)
}
