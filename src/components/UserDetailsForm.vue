<template>
  <el-container>
    <student-details :userId="userId"></student-details>
    <el-footer>
      <div>
        <span id="commentsHeader">Comments</span>
        <br>
        <div id="comments">
          <span id="commentsText">{{userDetails.comments}}</span>
        </div>
        <hr>
        <el-container>
          <el-col :span="14">
            <div id="paymentAndAttendanceHeader">
              <span>Student Attendance</span>
            </div>
            <el-row id="commentsRow">
              <el-row>
                <lesson-selector v-model="selectedLessonId"></lesson-selector>
              </el-row>
              <el-table max-height="500" :data="attendanceData" style="width: 90%">
                <el-table-column prop="lessonType" label="Lesson Type"></el-table-column>
                <el-table-column prop="timestamp" label="Date and Time of attendance taken"></el-table-column>
                <el-table-column prop="presence" label="Presence"></el-table-column>
              </el-table>
            </el-row>
            <payment-history :userId="userId"></payment-history>
          </el-col>
          <el-col :span="10">
            <div id="paymentAndAttendanceHeader">
              <span>Payment Type</span>
            </div>
            <el-switch
              v-model="payment.paymentType"
              inactive-text="Pay by credit/debit card"
              active-text="Pay by cash/nets"
              :active-value="CASHNETS"
              :inactive-value="CARD"
              inactive-color="#13ce66"
              active-color="#0061ff"
              style="padding-top: 10px;"
              :width="60"
            ></el-switch>
            <el-row id="commentsRow">
              <el-button @click="payment.paymentDialogLessonVisible = true">Lesson Payment</el-button>
            </el-row>
            <el-row id="commentsRow">
              <el-button @click="payment.paymentDialogVisible = true">Miscellaneous Payment</el-button>
            </el-row>
            <span id="paymentAndAttendanceHeader">Register Credit/Debit Card</span>
            <br>
            <card-registration
              style="margin-top: 20px"
              :customerDetails="customerDetails"
              :userId="userId"
            ></card-registration>
            <br>
            <span id="paymentAndAttendanceHeader">Lessons Enrolled</span>
            <lesson-table :userId="userId"></lesson-table>
          </el-col>
        </el-container>
      </div>
    </el-footer>
    <el-dialog
      title="Miscellaneous Payment"
      :show-close="!this.paymentLoading"
      :close-on-click-modal="!this.paymentLoading"
      :close-on-press-escape="this.paymentLoading"
      :visible.sync="payment.paymentDialogVisible"
    >
      <el-form :model="payment.paymentForm" :rules="payment.rules" ref="paymentForm">
        <el-form-item label="Item paying for" prop="type">
          <el-cascader :options="miscPaymentCascaderOptions" v-model="payment.paymentForm.type"></el-cascader>
        </el-form-item>
        <el-form-item label="Description">
          <el-input type="textarea" v-model="payment.paymentForm.description"></el-input>
        </el-form-item>
        <el-form-item
          v-if="payment.paymentType === CARD && customerDetails === undefined"
          label="Card Information"
        >
          <card :stripe="stripeKey"></card>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button
          v-if="payment.paymentType === CARD"
          :loading="this.paymentLoading"
          type="primary"
          @click="payCardMisc('paymentForm')"
        >Pay</el-button>
        <el-button
          v-else
          :loading="this.paymentLoading"
          type="primary"
          @click="payCashMisc('paymentForm')"
        >Pay</el-button>
        <el-button v-if="!this.paymentLoading" @click="payment.paymentDialogVisible = false">Cancel</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="Lessons Payment"
      :show-close="!this.paymentLoading"
      :close-on-click-modal="!this.paymentLoading"
      :close-on-press-escape="this.paymentLoading"
      :visible.sync="payment.paymentDialogLessonVisible"
    >
      <el-form :model="payment.paymentForm" :rules="payment.rules" ref="paymentForm">
        <el-form-item label="Item paying for" prop="type">
          <el-cascader :options="lessonsPaymentCascaderOptions" v-model="payment.paymentForm.type"></el-cascader>
        </el-form-item>
        <el-form-item label="Description">
          <el-input type="textarea" v-model="payment.paymentForm.description"></el-input>
        </el-form-item>
        <el-form-item
          v-if="payment.paymentType === CARD && customerDetails === undefined"
          label="Card Information"
        >
          <card :stripe="stripeKey"></card>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button
          v-if="payment.paymentType === CARD"
          :loading="this.paymentLoading"
          type="primary"
          @click="payCardLessons('paymentForm')"
        >Pay</el-button>
        <el-button
          v-else
          :loading="this.paymentLoading"
          type="primary"
          @click="payCashLessons('paymentForm')"
        >Pay</el-button>
        <el-button
          v-if="!this.paymentLoading"
          @click="payment.paymentDialogLessonVisible = false"
        >Cancel</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
import _ from "lodash"
import moment from "moment"
import RecieptGenerator from "@/assets/reciept"
import LessonSelector from "@/components/lessons/LessonSelector"
import DateSelector from "@/components/utils/DateSelector"
import { Card, createToken } from "vue-stripe-elements-plus"
import {
  CARD,
  CASHNETS,
  MISCELLEANEOUS,
  LESSONS,
  REFUNDED,
} from "@/common/data"
import LessonTable from "@/components/lessons/LessonTable"
import CardRegistration from "@/components/common/CardRegistration"
import StudentDetails from "@/components/studentDetails/StudentDetails"
import PaymentHistory from "@/components/studentDetails/PaymentHistory"

export default {
  components: {
    LessonSelector,
    DateSelector,
    Card,
    LessonTable,
    CardRegistration,
    StudentDetails,
    PaymentHistory,
  },
  async mounted() {
    const { selectedLessonId, dateRange } = this.$route.query
    const details = this.$store.getters.getStudentInfo(
      this.$route.query["userId"]
    )
    const userDetails = _.pick(details, ["comments"])

    this.userDetails = userDetails
    this.customerDetails = details.customer
    this.selectedLessonId = selectedLessonId
    this.attendanceDateRange = dateRange.map((date) => moment(date).toDate())
  },
  computed: {
    attendanceData() {
      const details = this.$store.getters.getStudentInfo(
        this.$route.query["userId"]
      )
      let filteredData = _.filter(details.attendance, (attendance) => {
        if (
          this.selectedLessonId.length !== 0 &&
          this.selectedLessonId !== undefined
        ) {
          return attendance.lessonId === this.selectedLessonId
        }
        return true
      })
      // if (
      //   this.attendanceDateRange.length > 0 &&
      //   !moment(this.attendanceDateRange[0]).isSame(moment(0))
      // ) {
      //   const startDate = this.attendanceDateRange[0]
      //   const endDate = this.attendanceDateRange[1]
      //   const selectionRange = moment.range(startDate, endDate)
      //   filteredData = _.filter(filteredData, (user) => {
      //     for (const attendance of _.values(user.attendance)) {
      //       return selectionRange.contains(moment(attendance.timestamp))
      //     }
      //     return false
      //   })
      // }
      return _.map(filteredData, (attendanceData) => ({
        ...attendanceData,
        timestamp: moment(attendanceData.timestamp).format("DD-MM-YY, h:mma"),
        lessonType: this.$store.getters.getLessonData(attendanceData.lessonId)
          .name,
      }))
    },
    paymentLoading() {
      return this.$store.getters.getStudentDataLoading
    },
    miscPaymentCascaderOptions() {
      const priceList = this.$store.getters.getPriceList[MISCELLEANEOUS]
      const options = _.map(priceList, (value, category) => {
        const subCategory = _.map(value, (price, subcategory) => {
          const label = `${subcategory}, $${price}`
          const subCategoryOptions = {
            label,
            value: subcategory,
          }
          return subCategoryOptions
        })
        return {
          label: category,
          value: category,
          children: subCategory,
        }
      })
      return options
    },
    lessonsPaymentCascaderOptions() {
      const priceList = this.$store.getters.getPriceList[LESSONS]
      const options = _.map(priceList, (value, category) => {
        const subCategory = _.map(value, (value, subcategory) => {
          if (typeof value !== "object") {
            const label = `${subcategory} lessons, $${value}`
            const subCategoryOptions = {
              label,
              value: subcategory,
            }
            return subCategoryOptions
          } else {
            const children = _.map(value, (price, session) => {
              const label = `${session} lessons, $${price}`
              const options = {
                label,
                value: session,
              }
              return options
            })
            const subCategoryOptions = {
              label: subcategory,
              value: subcategory,
              children,
            }
            return subCategoryOptions
          }
        })
        return {
          label: category,
          value: category,
          children: subCategory,
        }
      })
      return options
    },
  },
  data() {
    return {
      active: true,
      userDetails: {
        comments: "",
      },
      customerDetails: {},
      selectedLessonId: "",
      attendanceDateRange: [],
      payment: {
        paymentType: "",
        paymentForm: {
          type: "",
          description: "",
        },
        rules: {
          type: [
            {
              required: true,
              message: "Please input what you are paying for",
              trigger: "blur",
            },
          ],
          price: [
            {
              required: true,
              message: "Please input the amount to charge",
              trigger: "blur",
            },
          ],
        },

        paymentDialogVisible: false,
        paymentDialogLessonVisible: false,
      },
      CARD,
      CASHNETS,
      REFUNDED,
      stripeKey: process.env.VUE_APP_STRIPE_KEY,
      userId: this.$route.query["userId"],
    }
  },
  methods: {
    payCardMisc(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          let paymentToken
          if (this.customerDetails === undefined) {
            const token = await createToken()
            if (token.error) {
              this.$notify.error({
                title: "Card Error",
                message: token.error.message,
              })
            }
            paymentToken = token.token.id
          } else {
            paymentToken = this.customerDetails.customerId
          }
          const priceList = this.$store.getters.getPriceList
          let price = priceList[MISCELLEANEOUS]
          for (const key of this.payment.paymentForm.type) {
            price = price[key]
          }
          let paymentDataAndVm = {
            type: CARD,
            paymentData: {
              paymentInfo: {
                ...this.payment.paymentForm,
                type: [MISCELLEANEOUS, ...this.payment.paymentForm.type],
                price,
                userEmail: this.contactDetails.email,
              },
              paymentToken,
            },
            userId: this.$route.query["userId"],
            vm: this,
          }
          if (this.customerDetails !== undefined) {
            paymentDataAndVm = {
              ...paymentDataAndVm,
              customer: true,
            }
          }
          await this.$store.dispatch("addSinglePayment", paymentDataAndVm)
          this.payment.paymentDialogVisible = false
        }
      })
    },
    payCashMisc(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          const priceList = this.$store.getters.getPriceList
          let price = priceList[MISCELLEANEOUS]
          for (const key of this.payment.paymentForm.type) {
            price = price[key]
          }
          const paymentDataAndVm = {
            type: CASHNETS,
            paymentData: {
              paymentInfo: {
                ...this.payment.paymentForm,
                type: [MISCELLEANEOUS, ...this.payment.paymentForm.type],
                price,
                userEmail: this.contactDetails.email,
              },
            },
            userId: this.$route.query["userId"],
            vm: this,
          }

          const dispatch = this.$store.dispatch(
            "addSinglePayment",
            paymentDataAndVm
          )
          const recp = RecieptGenerator(
            [LESSONS, ...this.payment.paymentForm.type].join(" / "),
            this.payment.paymentForm.description,
            price
          )
          await Promise.all([dispatch, recp])
          this.payment.paymentDialogVisible = false
        }
      })
    },
    payCashLessons(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          const priceList = this.$store.getters.getPriceList
          let price = priceList[LESSONS]
          for (const key of this.payment.paymentForm.type) {
            price = price[key]
          }
          const paymentDataAndVm = {
            paymentData: {
              paymentInfo: {
                ...this.payment.paymentForm,
                type: [LESSONS, ...this.payment.paymentForm.type],
                price,
                userEmail: this.contactDetails.email,
              },
            },
            userId: this.$route.query["userId"],
            vm: this,
          }
          const dispatch = this.$store.dispatch(
            "addLessonCashPayment",
            paymentDataAndVm
          )
          const recp = RecieptGenerator(
            [LESSONS, ...this.payment.paymentForm.type].join(" / "),
            this.payment.paymentForm.description,
            price
          )
          await Promise.all([dispatch, recp])
          this.payment.paymentDialogLessonVisible = false
        }
      })
    },
    payCardLessons(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          let paymentToken
          if (this.customerDetails === undefined) {
            const token = await createToken()
            if (token.error) {
              this.$notify.error({
                title: "Card Error",
                message: token.error.message,
              })
            }
            paymentToken = token.token.id
          } else {
            paymentToken = this.customerDetails.customerId
          }

          const priceList = this.$store.getters.getPriceList
          let price = priceList[LESSONS]
          for (const key of this.payment.paymentForm.type) {
            price = price[key]
          }
          const paymentDataAndVm = {
            paymentData: {
              paymentInfo: {
                ...this.payment.paymentForm,
                type: [LESSONS, ...this.payment.paymentForm.type],
                price,
                userEmail: this.contactDetails.email,
              },
              paymentToken,
            },
            userId: this.$route.query["userId"],
            vm: this,
          }
          const dispatch = this.$store.dispatch(
            "addLessonCardPayment",
            paymentDataAndVm
          )
          const recp = RecieptGenerator(
            [LESSONS, ...this.payment.paymentForm.type].join(" / "),
            this.payment.paymentForm.description,
            price
          )
          await Promise.all([dispatch, recp])
          this.payment.paymentDialogLessonVisible = false
        }
      })
    },
  },
}
</script>

<style scoped>
.datePicker {
  display: flex;
  align-self: flex-start;
}
.commentsHeader {
  display: inline-block;
  text-align: center;
  padding-bottom: 10px;
}

#commentsRow {
  margin-bottom: 20px;
  margin-top: 20px;
}

#comments {
  margin-top: 10px;
  border: 1px solid black;
}

#commentsHeader {
  font-size: 25px;
  padding-bottom: 10px;
}

#commentsText {
  font-size: 18px;
}

#paymentAndAttendanceHeader {
  font-size: 25px;
}
</style>
