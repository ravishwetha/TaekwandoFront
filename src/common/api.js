import Axios from "axios"
import firebase from "firebase"
import { firebaseConfig } from "@/common/data"

export const firebaseDB = firebase.initializeApp(firebaseConfig)

export const axiosConfig = () => {
  return Axios.create({
    baseURL: process.env.VUE_APP_API,
  })
}

export const loginAPI = async (encryptedUsernamePassword) => {
  const api = await axiosConfig()
  return api
    .get("/login", {
      params: {
        encryptedUsernamePassword,
      },
    })
    .then((r) => r.data)
}

export const priceListAPI = async () => {
  return await firebase
    .database()
    .ref("priceList")
    .once("value")
    .then((snapshot) => snapshot.val())
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

export const absentSmsAPI = async ({ absenteeNumbers }) => {
  const api = await axiosConfig()
  return api
    .post("/sms/absent", {
      absenteeNumbers,
    })
    .then((r) => r.data)
}

export const tokenPaymentAPI = async (
  paymentInfo,
  token,
  customer,
  userEmail
) => {
  const api = await axiosConfig()
  console.log(token)
  return api
    .post("/payment/token", { paymentInfo, token, customer, userEmail })
    .then((r) => r.data)
}

export const refundAPI = async (chargeId) => {
  const api = await axiosConfig()
  return api.post("/payment/refund", { chargeId }).then((r) => r.data)
}

export const deleteCustomerAPI = async (customerId) => {
  const api = await axiosConfig()
  return api.post("/payment/refund", { customerId }).then((r) => r.data)
}

export const cardRegistrationAPI = async ({ cardToken }) => {
  const api = await axiosConfig()
  return api.post("/payment/registration", { cardToken }).then((r) => r.data)
}
