<template>
  <el-container>
    <el-main>
      <el-col class="userDetailsCol">
        <span id="detailsHeader">Student Details</span>
        <el-form style="paddingRight: 10px;" :model="userDetails" label-width="105px" ref="form">
          <el-form-item id="detailsText" label="Name:">
            <span>{{userDetails.name}}</span>
          </el-form-item>
          <el-form-item id="detailsText" label="Belt:">
            <span>{{userDetails.belt}}</span>
          </el-form-item>
          <el-form-item id="detailsText" label="Class Type:">
            <span>{{userDetails.classType}}</span>
          </el-form-item>
          <el-form-item id="detailsText" label="Date Enrolled:">
            <span>{{userDetails.enrollmentDate}}</span>
          </el-form-item>
          <el-form-item id="detailsText" label="DOB:">
            <span>{{userDetails.dob}}</span>
          </el-form-item>
          <el-form-item id="detailsText" label="NRIC:">
            <span>{{userDetails.nric}}</span>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col class="contactDetailsCol">
        <span id="detailsHeader">Contact Details</span>
        <el-form :model="contactDetails" label-width="100px" ref="form">
          <el-form-item id="detailsText" label="Email:">
            <span>{{contactDetails.email}}</span>
          </el-form-item>
          <el-form-item id="detailsText" label="Phone:">
            <span>{{contactDetails.contact}}</span>
          </el-form-item>
          <el-form-item id="detailsText" label="Address:">
            <span>{{contactDetails.address}}</span>
          </el-form-item>
        </el-form>
        <div style="margin-left: 200px; margin-bottom: 50px">
          <el-button @click="editUser()" style="width: 80%" type="success">Edit User</el-button>
        </div>
        <div style="margin-left: 200px;">
          <el-button @click="deleteUser()" style="width: 80%" type="danger">Delete User</el-button>
        </div>
      </el-col>
    </el-main>
    <el-footer>
      <div>
        <span id="commentsHeader">Comments</span>
        <br>
        <div id="comments">
          <span id="commentsText">{{userDetails.comments}}</span>
        </div>
        <hr>
        <el-container>
          <el-col :span="18">
            <div id="paymentAndAttendanceHeader">
              <span>Student Attendance</span>
            </div>
            <el-row id="commentsRow">
              <el-row>
                <lesson-selector v-model="selectedLessonId"></lesson-selector>
              </el-row>
              <el-table max-height="500" :data="attendanceData" style="width: 90%">
                <el-table-column prop="lessonType" label="Lesson Type"></el-table-column>
                <el-table-column prop="timestamp" label="Date of attendance taken"></el-table-column>
                <el-table-column prop="presence" label="Presence"></el-table-column>
              </el-table>
            </el-row>
            <div id="paymentAndAttendanceHeader">
              <span>Payment History</span>
            </div>
            <el-row id="commentsRow">
              <el-row>
                <date-selector style="margin-left: 20px;" v-model="paymentDateRange"></date-selector>
              </el-row>
              <el-table max-height="500" :data="paymentData" style="width: 90%">
                <el-table-column prop="mode" label="Payment mode"></el-table-column>
                <el-table-column prop="type" label="Item paid for"></el-table-column>
                <el-table-column prop="description" label="Payment Description"></el-table-column>
                <el-table-column prop="price" label="Amount"></el-table-column>
              </el-table>
            </el-row>
          </el-col>
          <el-col :span="6">
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
            <el-row v-if="payment.paymentType === CASHNETS" id="commentsRow">
              <el-button>Add Payment</el-button>
            </el-row>
            <el-row id="commentsRow">
              <el-button @click="payment.paymentDialogVisible = true">Miscellaneous Payment</el-button>
            </el-row>
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
        <el-form-item v-if="payment.paymentType === CARD" label="Card Information">
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
  </el-container>
</template>

<script>
import _ from "lodash"
import moment from "moment"
import LessonSelector from "@/components/lessons/LessonSelector"
import DateSelector from "@/components/utils/DateSelector"
import { Card, createToken } from "vue-stripe-elements-plus"
import { CARD, CASHNETS } from "@/common/data"
import LessonTable from "@/components/lessons/LessonTable"
import { MISCELLEANEOUS } from "../common/data"

export default {
  components: {
    LessonSelector,
    DateSelector,
    Card,
    LessonTable,
  },
  async mounted() {
    const { selectedLessonId, dateRange } = this.$route.query
    const details = this.$store.getters.getStudentInfo(
      this.$route.query["userId"]
    )
    let userDetails = _.pick(details, [
      "name",
      "belt",
      "classType",
      "dob",
      "nric",
      "enrollmentDate",
      "comments",
    ])

    userDetails = {
      ...userDetails,
      enrollmentDate: moment(userDetails.enrollmentDate).format("DD-MM-YYYY"),
      dob: moment(userDetails.dob).format("DD-MM-YYYY"),
    }
    this.userDetails = userDetails

    const contactDetails = _.pick(details, ["email", "contact", "address"])
    this.contactDetails = contactDetails
    this.selectedLessonId = selectedLessonId
    this.attendanceDateRange = dateRange.map((date) => moment(date).toDate())
  },
  computed: {
    paymentData() {
      const details = this.$store.getters.getStudentInfo(
        this.$route.query["userId"]
      )
      let filteredData = _.values(details.payments)

      if (
        this.paymentDateRange.length > 0 &&
        !moment(this.paymentDateRange[0]).isSame(moment(0))
      ) {
        const startDate = this.paymentDateRange[0]
        const endDate = this.paymentDateRange[1]
        const selectionRange = moment.range(startDate, endDate)
        filteredData = _.filter(filteredData, (data) => {
          return selectionRange.contains(moment(data.created))
        })
      }
      const displayData = _.map(filteredData, (data) => {
        const paymentType = data.type
        let parsedType = ""
        for (const type of paymentType) {
          parsedType = parsedType + `${type} / `
        }
        return { ...data, type: parsedType }
      })
      return displayData
    },
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
      if (
        this.attendanceDateRange.length > 0 &&
        !moment(this.attendanceDateRange[0]).isSame(moment(0))
      ) {
        const startDate = this.attendanceDateRange[0]
        const endDate = this.attendanceDateRange[1]
        const selectionRange = moment.range(startDate, endDate)
        filteredData = _.filter(filteredData, (user) => {
          for (const attendance of _.values(user.attendance)) {
            return selectionRange.contains(moment(attendance.timestamp))
          }
          return false
        })
      }
      return _.map(filteredData, (attendanceData) => ({
        ...attendanceData,
        timestamp: moment(attendanceData.timestamp).format("DD-MM-YY"),
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
  },
  data() {
    return {
      userDetails: {
        name: "",
        belt: "",
        classType: "",
        dob: "",
        nric: "",
        enrollmentDate: "",
        comments: "",
      },
      contactDetails: {
        email: "",
        contact: "",
        address: "",
      },
      selectedLessonId: "",
      attendanceDateRange: [],
      paymentDateRange: [],
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
      },
      CARD,
      CASHNETS,
      stripeKey: process.env.VUE_APP_STRIPE_KEY,
      userId: this.$route.query["userId"],
    }
  },
  methods: {
    payCardMisc(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          const token = await createToken()
          if (token.error) {
            this.$notify.error({
              title: "Card Error",
              message: token.error.message,
            })
          }
          const priceList = this.$store.getters.getPriceList
          let price = priceList[MISCELLEANEOUS]
          for (const key of this.payment.paymentForm.type) {
            price = price[key]
          }
          const paymentDataAndVm = {
            type: CARD,
            paymentData: {
              paymentInfo: {
                ...this.payment.paymentForm,
                type: [MISCELLEANEOUS, ...this.payment.paymentForm.type, price],

                userEmail: this.contactDetails.email,
              },
              paymentToken: token.token.id,
            },
            userId: this.$route.query["userId"],
            vm: this,
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
                type: [MISCELLEANEOUS, ...this.payment.paymentForm.type, price],
                userEmail: this.contactDetails.email,
              },
            },
            userId: this.$route.query["userId"],
            vm: this,
          }

          await this.$store.dispatch("addSinglePayment", paymentDataAndVm)
          this.payment.paymentDialogVisible = false
        }
      })
    },
    addUser() {
      const payload = {
        ...this.userDetails,
        ...this.contactDetails,
      }
      this.$store.dispatch("addUser", payload)
      this.$router.push({
        name: "home",
      })
    },
    deleteUser() {
      this.$store.dispatch("deleteUser", {
        userId: this.$route.query["userId"],
      })
      this.$notify({
        title: "Student Terminated",
        message: "Student has been terminated.",
      })
      this.$router.push({
        name: "home",
      })
    },
    editUser() {
      this.$router.push({
        name: "edit",
        query: {
          userId: this.$route.query["userId"],
        },
      })
    },
  },
}
</script>

<style scoped>
.userDetailsCol {
  margin-left: 5%;
}
.contactDetailsCol {
  margin-right: 5%;
}
.datePicker {
  display: flex;
  align-self: flex-start;
}
.commentsHeader {
  display: inline-block;
  text-align: center;
  padding-bottom: 10px;
}
.el-main {
  display: flex;
  flex-direction: row;
}
#detailsHeader {
  display: block;
  text-align: center;
  padding-bottom: 20px;
  font-size: 40px;
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

#detailsText {
  border: 1px solid black;
}

#paymentAndAttendanceHeader {
  font-size: 25px;
}
</style>
