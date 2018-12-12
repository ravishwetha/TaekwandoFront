<template>
  <div>
    <el-table :data="lessonData" style="width: 100%">
      <el-table-column prop="name" label="Lesson Name"></el-table-column>
      <el-table-column prop="sessions" label="Payment Cycle"></el-table-column>
      <el-table-column label="Operations" fixed="right">
        <template slot-scope="scope">
          <el-button @click="swap(scope.row)" type="text" size="small">Swap</el-button>
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
      <span>Select which lesson to swap to from below</span>
      <br>
      <el-select v-model="lessonSwappingTo" style="margin-top: 20px">
        <el-option
          v-for="lesson in swapLessonData"
          :key="lesson.id"
          :value="lesson.id"
          :label="lesson.name"
        ></el-option>
      </el-select>
      <br>
      <span>Select the number of sessions for payment plan</span>
      <br>
      <el-select v-model="lessonSwappingToSessions" placeholder="Select">
        <el-option v-for="item in sessionOptions" :key="item" :label="item" :value="item"></el-option>
      </el-select>
      <br>
      <span>Select the timeslot to swap the student into</span>
      <br>
      <el-select v-model="lessonSwappingToTimeslot" placeholder="Select">
        <el-option
          v-for="item in selectedLessonTimeslots"
          :key="item.val"
          :label="item.label"
          :value="item.val"
        ></el-option>
      </el-select>
      <br>
      <span>Select the day of lesson this student is in</span>
      <br>
      <el-select v-model="lessonSwappingToDay" placeholder="Select">
        <el-option v-for="item in DAYS" :key="item" :label="item" :value="item"></el-option>
      </el-select>
      <span slot="footer">
        <el-button type="primary" @click="conductSwap">Swap</el-button>
        <el-button @click="swapDialogVisible = false">Cancel</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash"
import moment from "moment"
import { DAYS } from "@/common/data"
import AddUserToLessonModal from "@/components/lessons/AddUserToLessonsDialog"
export default {
  components: {
    AddUserToLessonModal,
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
        (userLessonDetails, lessonId) => ({
          name: _.get(allLessonData[lessonId], "name"),
          sessions: userLessonDetails.paymentPlan,
          id: lessonId,
        })
      )
      return lessonNamePaymentCycleUserIsIn
    },
    selectedLessonTimeslots() {
      const allLessonData = this.$store.getters.getAllLessonData
      const selectedLessonPayload = _.get(allLessonData, this.lessonAddingTo)
      const selectedLessonTimeslots = _.get(selectedLessonPayload, "timeslots")
      const selectOptions = _.map(selectedLessonTimeslots, (timeslot) => {
        const [from, to] = timeslot.split("/")
        const parsedFrom = moment(from).format("ha")
        const parsedTo = moment(to).format("ha")
        return { label: parsedFrom + "-" + parsedTo, val: timeslot }
      })
      return selectOptions
    },
  },
  data() {
    const details = this.$store.getters.getStudentInfo(this.userId)
    const lessonIdsUserIsIn = _.map(
      details.lessons,
      (userLessonDetails, lessonId) => lessonId
    )
    const allLessonData = this.$store.getters.getAllLessonData
    const allLessonDataExceptUserIn = _.omitBy(
      allLessonData,
      (lessonData, lessonId) => _.includes(lessonIdsUserIsIn, lessonId)
    )

    const allLessonDataExceptUserInIds = _.map(
      allLessonDataExceptUserIn,
      (data, id) => ({ ...data, id })
    )
    return {
      swapLessonData: allLessonDataExceptUserInIds,
      lessonIdToBeSwapped: "",
      lessonSwappingTo: "",
      lessonSwappingToSessions: "",
      lessonSwappingToTimeslot: "",
      lessonSwappingToDay: "",
      swapDialogVisible: false,
      addDialogVisible: false,
      sessionOptions: [4, 12, 24],
      DAYS,
    }
  },
  methods: {
    swap(lesson) {
      this.lessonIdToBeSwapped = lesson.id
      this.swapDialogVisible = true
    },
    closeAddDialog() {
      this.addDialogVisible = false
    },
    async conductSwap() {
      const swapLessonPayload = {
        oldlessonId: this.lessonIdToBeSwapped,
        newLessonId: this.lessonSwappingTo,
        userIdSessions: {
          userId: this.userId,
          sessions: this.lessonSwappingToSessions,
          timeslot: this.lessonSwappingToTimeslot,
        },
      }
      await this.$store.dispatch("swapLessonForUser", swapLessonPayload)
      this.swapDialogVisible = false
    },
  },
}
</script>

<style>
</style>
