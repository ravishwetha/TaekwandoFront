<template>
  <el-container>
    <student-details :userId="userId"></student-details>
    <el-footer>
      <span id="commentsHeader">Activities</span>
      <hr>
      <el-collapse v-model="activeCollapse">
        <el-collapse-item name="Payment Operations">
          <template slot="title">
            <span id="paymentAndAttendanceHeader">Payment Operations</span>
          </template>
          <div style="display: flex; flex-direction: row">
            <div>
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
            </div>
            <card-registration style="margin-left: 20px" :userId="userId"></card-registration>
          </div>
        </el-collapse-item>
        <el-collapse-item name="Payment History">
          <template slot="title">
            <span id="paymentAndAttendanceHeader">Payment History</span>
          </template>
          <payment-history :userId="userId"></payment-history>
        </el-collapse-item>
        <el-collapse-item name="Student Attendance">
          <template slot="title">
            <span id="paymentAndAttendanceHeader">Student Attendance</span>
          </template>
          <div>
            <span style="margin-right: 20px">Select lesson to filter:</span>
            <lesson-selector v-model="selectedLessonId"></lesson-selector>
          </div>
          <div>
            <span style="margin-right: 27px">Select dates to filter:</span>
            <date-selector v-model="attendanceDateRange"></date-selector>
          </div>
          <el-table max-height="500" :data="attendanceData" style="width: 90%">
            <el-table-column width="130px" prop="lessonType" label="Lesson Type"></el-table-column>
            <el-table-column width="70px" prop="day" label="Day"></el-table-column>
            <el-table-column width="150px" prop="timeslot" label="Timeslot"></el-table-column>
            <el-table-column width="150px" prop="timestamp" label="Taken on"></el-table-column>
            <el-table-column width="100px" prop="presence" label="Presence"></el-table-column>
            <el-table-column width="120px" prop="takenBy" label="Taken By"></el-table-column>
            <el-table-column width="400px" prop="description" label="Description"></el-table-column>
            <el-table-column label="Operations" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="deleteAttendance(scope.row)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
        <el-collapse-item name="Lessons Enrolled">
          <template slot="title">
            <span id="paymentAndAttendanceHeader">Lessons Enrolled</span>
          </template>
          <lesson-table :userId="userId"></lesson-table>
        </el-collapse-item>
      </el-collapse>
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
          <p>Select {{form.lessonMisc}} item:</p>
          <el-cascader
            style="width: 100%"
            :options="form.lessonMisc === `LESSONS` ? lessonsPaymentCascaderOptions : miscPaymentCascaderOptions"
            v-model="form.type"
          ></el-cascader>
          <p>Discount to give:</p>
          <el-input type="number" v-model="form.discount">
            <template slot="prepend">$</template>
          </el-input>
          <p>Description:</p>
          <el-input type="textarea" v-model="form.description"></el-input>
          <el-button @click.prevent="removePaymentItem(form)">Delete item</el-button>
          <hr>
        </el-form-item>

        <el-form-item
          v-if="payment.paymentType === CARD && customerDetails === undefined"
          label="Card Information (If card input does not appear, reload the page.)"
        >
          <card :stripe="stripeKey"></card>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <p>Total Price to Charge: ${{totalPriceToCharge}}</p>
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
import { PRESENT, MAKEUP, ABSENT, NUMBER_DAYS } from "../common/data"

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
      let filteredData = _.map(
        _.get(details, "attendance", {}),
        (attendance, id) => ({ ...attendance, attendanceId: id })
      )
      filteredData = _.filter(filteredData, (attendance) => {
        if (
          this.selectedLessonId !== undefined &&
          this.selectedLessonId.length !== 0
        ) {
          return attendance.lessonId === this.selectedLessonId
        }
        return true
      })
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
        [MAKEUP]: 1,
        [ABSENT]: 3,
      }
      //sort by timestamp
      filteredData = _.sortBy(
        filteredData,
        (attendance) => -moment(attendance.timestamp).unix()
      )

      // sort by presence
      filteredData = _.sortBy(
        filteredData,
        (attendance) => sortingPriorityLevels[attendance.presence]
      )
      return _.map(filteredData, (attendanceData) => ({
        ...attendanceData,
        timestamp: moment(attendanceData.timestamp).format("DD-MM-YY, h:mma"),
        lessonType: this.$store.getters.getLessonData(attendanceData.lessonId)
          .name,
        day: NUMBER_DAYS[moment(attendanceData.dateOfLesson).day()],
      }))
    },
    paymentLoading() {
      return this.$store.getters.getStudentDataLoading
    },
    miscPaymentCascaderOptions() {
      const priceList = this.$store.getters.getPriceList[MISCELLEANEOUS]
      const options = _.map(priceList, (value, category) => {
        const subCategory = _.map(value, (price, subcategory) => {
          //Does not work
          // const label = (
          //   <span>
          //     {subcategory}, <b style="color: green;">${price}</b>
          //   </span>
          // )
          const subCategoryOptions = {
            label: `${subcategory}, $${price}`,
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
        const subCat = _.map(value, (value, subcategory) => {
          if (typeof value !== "object") {
            // const label = (
            //   <span>
            //     {subcategory} lessons, <b style="color: green;">${value}</b>
            //   </span>
            // )
            const subCategoryOptions = {
              label: `${subcategory} lessons, $${value}`,
              value: subcategory,
            }
            return subCategoryOptions
          } else {
            const children = _.map(value, (price, session) => {
              // const label = (
              //   <span>
              //     {subcategory} lessons, <b style="color: green;">${price}</b>
              //   </span>
              // )
              const options = {
                label: `${session} lessons, $${price}`,
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
          children: subCat,
        }
      })
      return options
    },
    totalPriceToCharge() {
      const priceArray = _.map(this.payment.paymentForm, (paymentForm) => {
        const priceList = this.$store.getters.getPriceList
        let price = priceList[paymentForm.lessonMisc]
        for (const key of paymentForm.type) {
          price = price[key]
        }
        const toCharge = price - Number.parseFloat(paymentForm.discount)
        return _.isNaN(toCharge) ? 0 : toCharge
      })
      return _.sum(priceArray)
    },
  },
  data() {
    return {
      activeCollapse: ["Payment Operations"],
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
            discount: 0,
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
    deleteAttendance({ attendanceId }) {
      this.$store.dispatch("deleteAttendanceRecord", {
        attendanceId,
        userId: this.userId,
      })
    },
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
        discount: 0,
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
            price = price - Number.parseFloat(paymentForm.discount)
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
            price = price - Number.parseFloat(paymentForm.discount)
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
