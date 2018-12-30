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
  return api
    .post("/payment/token", { paymentInfo, token, customer, userEmail })
    .then((r) => r.data)
}

export const ReceiptGeneratorAPI = async (
  paymentItems,
  userId,
  paymentType
) => {
  const api = await axiosConfig()
  return api
    .get("/payment/receipt", {
      params: {
        paymentItems,
        userId,
        paymentType,
      },
      responseType: "blob",
    })
    .then((r) => {
      var headers = r.headers
      var blob = new Blob([r.data], { type: headers["content-type"] })
      var link = document.createElement("a")
      link.href = window.URL.createObjectURL(blob)
      link.download = "receipt.pdf"
      link.click()
      // window.location = "/myfile/" + r.fileId
    })
}

export const refundAPI = async ({ chargeId, price }) => {
  const api = await axiosConfig()
  return api.post("/payment/refund", { chargeId, price }).then((r) => r.data)
}

export const deleteCustomerAPI = async (customerId) => {
  const api = await axiosConfig()
  return api.post("/payment/delete", { customerId }).then((r) => r.data)
}

export const cardRegistrationAPI = async ({ cardToken }) => {
  const api = await axiosConfig()
  return api.post("/payment/registration", { cardToken }).then((r) => r.data)
}
