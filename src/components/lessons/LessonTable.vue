<template>
  <span>
    <el-table :data="lessonData" style="width: 100%">
      <el-table-column prop="name" label="Name"></el-table-column>
      <el-table-column prop="lastPayment" label="Last Payment"></el-table-column>
      <el-table-column prop="expectPayment" label="Expected Payment"></el-table-column>
      <el-table-column width="70px" prop="day" label="Day"></el-table-column>
      <el-table-column width="150px" prop="timeslot" label="Timeslot"></el-table-column>
      <el-table-column width="70px" prop="price" label="Price"></el-table-column>
      <el-table-column width="120px" prop="entitlement" label="Lessons Left"></el-table-column>
      <el-table-column label="Operations" fixed="right">
        <template slot-scope="scope">
          <div>
            <el-button @click="swap(scope.row)" type="text" size="small">Swap</el-button>
          </div>
          <div>
            <el-button @click="removeLesson(scope.row)" type="text" size="small">Remove</el-button>
          </div>
          <div>
            <el-button
              type="text"
              size="small"
              @click="openUpdateExpectPaymentDialog(scope.row)"
            >Edit</el-button>
          </div>
          <el-button
            v-if="scope.row.lastPayment === undefined && scope.row.customer"
            @click="startPayment(scope.row)"
            type="text"
            size="small"
          >Start Payment</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button style="margin-top: 20px" @click="addDialogVisible = true">Add student into lesson</el-button>
    <add-user-to-lesson-modal
      :dialogVisible="addDialogVisible"
      :closeDialog="closeAddDialog"
      :lessonData="swapLessonData"
      :userId="userId"
    ></add-user-to-lesson-modal>
    <el-dialog title="Swap lesson" :visible.sync="swapDialogVisible">
      <span>Select which lesson to swap to from below:</span>
      <br>
      <el-select v-model="lessonSwappingTo" style="margin-top: 10px; margin-bottom: 10px;">
        <el-option
          v-for="lesson in swapLessonData"
          :key="lesson.id"
          :value="lesson.id"
          :label="lesson.name"
        ></el-option>
      </el-select>
      <br>
      <span>Select the number of sessions for payment plan:</span>
      <br>
      <el-select
        style="margin-top: 10px; margin-bottom: 10px;"
        v-model="lessonSwappingToSessions"
        placeholder="Select"
      >
        <el-option v-for="item in sessionOptions" :key="item" :label="item" :value="item"></el-option>
      </el-select>
      <br>
      <div v-if="!lessonSwappingToUnlimited">
        <span>Select the day and timeslot to swap the student into:</span>
        <br>
        <el-select
          style="margin-top: 10px; margin-bottom: 10px;"
          v-model="lessonSwappingToDayTimeslot"
          value-key="key"
          placeholder="Select"
        >
          <el-option
            v-for="item in selectedLessonTimeslots"
            :key="item.label"
            :label="item.label"
            :value="item.val"
          ></el-option>
        </el-select>
        <br>
      </div>
      <br>
      <el-checkbox label="Unlimited?" v-model="lessonSwappingToUnlimited"></el-checkbox>
      <span slot="footer">
        <el-button type="primary" @click="conductSwap">Swap</el-button>
        <el-button @click="swapDialogVisible = false">Cancel</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="Update new expected payment date and price"
      :visible.sync="expectPaymentEditDialogVisible"
    >
      <p>Next expected payment date:</p>
      <date-selector single v-model="updatedExpectPaymentDate"></date-selector>
      <p>Price to charge:</p>
      <el-input type="number" label="Price:" v-model="updatedExpectPaymentPrice"></el-input>
      <span slot="footer">
        <el-button type="primary" @click="updateExpectedPaymentDate">Update</el-button>
        <el-button @click="expectPaymentEditDialogVisible = false">Cancel</el-button>
      </span>
    </el-dialog>
  </span>
</template>

<script>
import _ from "lodash"
import moment from "moment"
import { DAYS, UNLIMITED } from "@/common/data"
import AddUserToLessonModal from "@/components/lessons/AddUserToLessonsDialog"
import DateSelector from "@/components/utils/DateSelector"

import {
  readableTimeslotParser,
  getDayAndTimeslotFromDayTimeslot,
} from "@/common/dateUtils"
import { dfsKeysArray } from "../../common/findUtils"
import { ONCE } from "../../common/data"
export default {
  components: {
    AddUserToLessonModal,
    DateSelector,
  },
  props: {
    userId: {
      type: String,
      required: true,
    },
  },
  computed: {
    lessonData() {
      const details = this.$store.getters.getStudentInfo(this.userId)
      const allLessonData = this.$store.getters.getAllLessonData
      const lessonNamePaymentCycleUserIsIn = _.map(
        details.lessons,
        (userLessonDetails, lessonId) => {
          const timeslot = readableTimeslotParser(userLessonDetails.timeslot)
          let day
          if (timeslot === UNLIMITED) {
            day = UNLIMITED
          } else {
            day = userLessonDetails.day
          }
          const lastPayment =
            userLessonDetails.lastPayment !== undefined
              ? moment(userLessonDetails.lastPayment).format("DD/MM/YYYY")
              : "Not set"
          const expectPayment =
            userLessonDetails.expectPayment !== undefined
              ? moment(userLessonDetails.expectPayment).format("DD/MM/YYYY")
              : "Not set"

          const lessonToPayFor = this.$store.getters.getLessonData(lessonId)
          const keyArray = dfsKeysArray(
            this.$store.getters.getPriceList,
            lessonToPayFor.name
          )
          const priceList = this.$store.getters.getPriceListFromKeyArray(
            keyArray
          )
          let sessionsPrice = priceList
          if (userLessonDetails.timeslot === UNLIMITED) {
            sessionsPrice = sessionsPrice[UNLIMITED]
              ? sessionsPrice[ONCE]
              : sessionsPrice
          } else {
            sessionsPrice = sessionsPrice[ONCE]
              ? sessionsPrice[ONCE]
              : sessionsPrice
          }
          const price = userLessonDetails.price
            ? userLessonDetails.price
            : sessionsPrice[userLessonDetails.paymentPlan]
          return {
            name: _.get(allLessonData[lessonId], "name"),
            sessions: userLessonDetails.paymentPlan,
            id: lessonId,
            lastPayment,
            expectPayment,
            customer: details.customer,
            day,
            timeslot,
            price,
            entitlement: userLessonDetails.paymentPlan,
          }
        }
      )
      return lessonNamePaymentCycleUserIsIn
    },
    selectedLessonTimeslots() {
      const allLessonData = this.$store.getters.getAllLessonData
      const selectedLessonPayload = _.get(allLessonData, this.lessonSwappingTo)
      const selectedDayLessonTimeslots = _.get(
        selectedLessonPayload,
        "dayTimeslots"
      )
      const selectOptions = _.map(selectedDayLessonTimeslots, (dayTimeslot) => {
        const { day, timeslot } = getDayAndTimeslotFromDayTimeslot(dayTimeslot)
        const englishTime = readableTimeslotParser(timeslot)
        return {
          label: `${day}, ${englishTime}`,
          val: { day, timeslot, key: Math.random() },
        }
      })
      return selectOptions
    },
  },
  data() {
    const allLessonData = this.$store.getters.getAllLessonData

    const allLessonDataExceptUserInIds = _.map(allLessonData, (data, id) => ({
      ...data,
      id,
    }))
    return {
      swapLessonData: allLessonDataExceptUserInIds,
      lessonIdToBeSwapped: "",
      lessonSwappingTo: "",
      lessonSwappingToSessions: "",
      lessonSwappingToDayTimeslot: "",
      lessonSwappingToUnlimited: false,
      swapDialogVisible: false,
      addDialogVisible: false,
      sessionOptions: [4, 12, 24],
      expectPaymentEditDialogVisible: false,
      updatedExpectPaymentDate: "",
      updatedExpectPaymentDateLessonId: "",
      updatedExpectPaymentPrice: "",
      DAYS: _.keys(DAYS),
    }
  },
  methods: {
    swap(lesson) {
      this.lessonIdToBeSwapped = lesson.id
      this.swapDialogVisible = true
    },
    openUpdateExpectPaymentDialog(row) {
      this.updatedExpectPaymentDateLessonId = row.id
      this.updatedExpectPaymentDate =
        row.expectPayment !== "Not set" ? moment(row.expectPayment) : ""
      this.updatedExpectPaymentPrice = row.price
      this.expectPaymentEditDialogVisible = true
    },
    updateExpectedPaymentDate() {
      const expectPayment = moment(this.updatedExpectPaymentDate).toISOString()
      this.$store.dispatch("updateExpectPaymentDateAndPrice", {
        userId: this.userId,
        lessonId: this.updatedExpectPaymentDateLessonId,
        expectPayment,
        price: Number.parseInt(this.updatedExpectPaymentPrice),
      })
      this.expectPaymentEditDialogVisible = false
    },
    closeAddDialog() {
      this.addDialogVisible = false
    },
    removeLesson({ id }) {
      this.$store.dispatch("removeUserFromLesson", {
        lessonId: id,
        userId: this.userId,
      })
    },
    async conductSwap() {
      let swapLessonPayload = {
        oldlessonId: this.lessonIdToBeSwapped,
        newLessonId: this.lessonSwappingTo,
      }
      if (this.lessonSwappingToUnlimited) {
        swapLessonPayload = {
          ...swapLessonPayload,
          userIdSessions: {
            userId: this.userId,
            timeslot: UNLIMITED,
            sessions: this.lessonSwappingToSessions,
          },
        }
      } else {
        swapLessonPayload = {
          ...swapLessonPayload,
          userIdSessions: {
            userId: this.userId,
            sessions: this.lessonSwappingToSessions,
            timeslot: this.lessonSwappingToDayTimeslot.timeslot,
            day: this.lessonSwappingToDayTimeslot.day,
          },
        }
      }

      await this.$store.dispatch("swapLessonForUser", swapLessonPayload)
      this.swapDialogVisible = false
    },
    async startPayment(lesson) {
      this.$store.dispatch("startPayment", {
        userId: this.userId,
        lessonId: lesson.id,
      })
    },
  },
}
</script>

<style>
</style>
