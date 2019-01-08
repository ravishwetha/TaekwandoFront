<template>
  <el-container>
    <student-details :userId="userId"></student-details>
    <el-footer>
      <div>
        <span id="commentsHeader">Activities</span>
        <hr>
        <el-container>
          <el-col :span="12">
            <div id="paymentAndAttendanceHeader">
              <span>Student Attendance</span>
            </div>
            <el-row id="commentsRow">
              <el-row>
                <div>
                  <span style="margin-right: 20px">Select lesson to filter:</span>
                  <lesson-selector v-model="selectedLessonId"></lesson-selector>
                </div>
                <div>
                  <span style="margin-right: 27px">Select dates to filter:</span>
                  <date-selector v-model="attendanceDateRange"></date-selector>
                </div>
              </el-row>
              <el-table max-height="500" :data="attendanceData" style="width: 90%">
                <el-table-column prop="lessonType" label="Lesson Type"></el-table-column>
                <el-table-column prop="timestamp" label="Attendance taken on"></el-table-column>
                <el-table-column prop="presence" label="Presence"></el-table-column>
                <el-table-column prop="takenBy" label="Taken By"></el-table-column>
              </el-table>
            </el-row>
            <br>
            <span id="paymentAndAttendanceHeader">Lessons Enrolled</span>
            <lesson-table :userId="userId"></lesson-table>
          </el-col>
          <el-col :span="12">
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
              <el-button
                :type="payment.paymentType === 'CARD' ? 'success' : 'primary'"
                @click="payment.paymentDialogLessonVisible = true"
              >Payment</el-button>
            </el-row>
            <payment-history :userId="userId"></payment-history>
            <br>
            <span id="paymentAndAttendanceHeader">Register Credit/Debit Card</span>
            <br>
            <card-registration style="margin-top: 20px" :userId="userId"></card-registration>
            <br>
          </el-col>
        </el-container>
      </div>
    </el-footer>
    <el-dialog
      title="Payment"
      :show-close="!this.paymentLoading"
      :close-on-click-modal="!this.paymentLoading"
      :close-on-press-escape="this.paymentLoading"
      :visible.sync="payment.paymentDialogLessonVisible"
    >
      <el-form :model="payment.paymentForm" :rules="payment.rules" ref="paymentForm">
        <el-form-item v-for="form in payment.paymentForm" :key="form.key">
          <p>Select {{form.lessonMisc}} Item:</p>
          <el-cascader
            style="width: 100%"
            :options="form.lessonMisc === `LESSONS` ? lessonsPaymentCascaderOptions : miscPaymentCascaderOptions"
            v-model="form.type"
          ></el-cascader>
          <br>
          <p>Description</p>
          <el-input type="textarea" v-model="form.description"></el-input>
          <el-button @click.prevent="removePaymentItem(form)">Delete item</el-button>
        </el-form-item>

        <el-form-item
          v-if="payment.paymentType === CARD && customerDetails === undefined"
          label="Card Information (If card input does not appear, reload the page.)"
        >
          <card :stripe="stripeKey"></card>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addPaymentItem(`MISCELLEANEOUS`)">Add Misc Payment Item</el-button>
        <el-button @click="addPaymentItem(`LESSONS`)">Add Lesson Payment Item</el-button>
        <el-button
          v-if="payment.paymentType === CARD"
          :loading="this.paymentLoading"
          type="primary"
          @click="payCard('paymentForm')"
        >Pay</el-button>
        <el-button
          v-else
          :loading="this.paymentLoading"
          type="primary"
          @click="payCash('paymentForm')"
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
import LessonSelector from "@/components/lessons/LessonSelector"
import DateSelector from "@/components/utils/DateSelector"
import { Card, createToken } from "vue-stripe-elements-plus"
import { CARD, CASHNETS, MISCELLEANEOUS, LESSONS } from "@/common/data"
import LessonTable from "@/components/lessons/LessonTable"
import CardRegistration from "@/components/common/CardRegistration"
import StudentDetails from "@/components/studentDetails/StudentDetails"
import PaymentHistory from "@/components/studentDetails/PaymentHistory"
import { PRESENT, MAKEUP, ABSENT } from "../common/data"

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
    this.customerDetails = details.customer
    const contactDetails = _.pick(details, ["email"])
    this.contactDetails = contactDetails
    this.selectedLessonId = selectedLessonId
    // if (dateRange !== undefined) {
    //   this.attendanceDateRange = dateRange.map((date) => moment(date).toDate())
    // }
  },
  computed: {
    attendanceData() {
      const details = this.$store.getters.getStudentInfo(
        this.$route.query["userId"]
      )
      let filteredData = _.filter(
        _.get(details, "attendance", {}),
        (attendance) => {
          if (
            this.selectedLessonId !== undefined &&
            this.selectedLessonId.length !== 0
          ) {
            return attendance.lessonId === this.selectedLessonId
          }
          return true
        }
      )
      if (
        this.attendanceDateRange.length > 0 &&
        !moment(this.attendanceDateRange[0]).isSame(moment(0))
      ) {
        const startDate = this.attendanceDateRange[0]
        const endDate = this.attendanceDateRange[1]
        const selectionRange = moment.range(startDate, endDate)
        filteredData = _.filter(filteredData, (attendance) => {
          return selectionRange.contains(moment(attendance.timestamp))
        })
      }
      const sortingPriorityLevels = {
        [PRESENT]: 1,
        [MAKEUP]: 2,
        [ABSENT]: 3,
      }
      // sort by presence
      filteredData = _.sortBy(
        filteredData,
        (attendance) => sortingPriorityLevels[attendance.presence]
      )

      //sort by timestamp
      filteredData = _.sortBy(
        filteredData,
        (attendance) => -moment(attendance.timestamp).unix()
      )
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
      contactDetails: {
        email: "",
      },
      customerDetails: {},
      selectedLessonId: [],
      attendanceDateRange: [],
      payment: {
        paymentType: "",
        paymentForm: [
          {
            type: "",
            description: "",
            key: Math.random(),
            lessonMisc: MISCELLEANEOUS,
          },
        ],
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
      stripeKey: process.env.VUE_APP_STRIPE_KEY,
      userId: this.$route.query["userId"],
    }
  },
  methods: {
    removePaymentItem(item) {
      const index = this.payment.paymentForm.indexOf(item)
      if (index !== -1) {
        this.payment.paymentForm.splice(index, 1)
      }
    },
    addPaymentItem(lessonMisc) {
      this.payment.paymentForm.push({
        type: "",
        description: "",
        key: Math.random(),
        lessonMisc,
      })
    },
    payCash(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          const paymentItems = this.payment.paymentForm.map((paymentForm) => {
            const priceList = this.$store.getters.getPriceList
            let price = priceList[paymentForm.lessonMisc]
            for (const key of paymentForm.type) {
              price = price[key]
            }
            return {
              paymentData: {
                paymentInfo: {
                  ...paymentForm,
                  type: [paymentForm.lessonMisc, ...paymentForm.type],
                  price,
                  userEmail: this.contactDetails.email,
                },
              },
            }
          })

          await this.$store.dispatch("addCashPayment", {
            paymentItems,
            vm: this,
            userId: this.$route.query["userId"],
            type: CASHNETS,
          })

          this.payment.paymentDialogLessonVisible = false
        }
      })
    },
    payCard(formName) {
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
          const paymentItems = this.payment.paymentForm.map((paymentForm) => {
            const priceList = this.$store.getters.getPriceList
            let price = priceList[paymentForm.lessonMisc]
            for (const key of paymentForm.type) {
              price = price[key]
            }
            return {
              paymentData: {
                paymentInfo: {
                  ...paymentForm,
                  type: [paymentForm.lessonMisc, ...paymentForm.type],
                  price,
                },
              },
            }
          })
          await this.$store.dispatch("addCardPayment", {
            paymentItems,
            vm: this,
            userId: this.$route.query["userId"],
            paymentToken,
            userEmail: this.contactDetails.email,
            customer: !_.isUndefined(this.customerDetails),
          })
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
