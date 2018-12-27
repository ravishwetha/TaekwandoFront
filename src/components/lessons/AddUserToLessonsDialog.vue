<template>
  <el-dialog title="Add student into lesson" :visible.sync="dialogVisible">
    <span>Select which lesson to add student into</span>
    <br>
    <el-select v-model="lessonAddingTo" style="margin-top: 20px">
      <el-option
        v-for="lesson in lessonData"
        :key="lesson.id"
        :value="lesson.id"
        :label="lesson.name"
      ></el-option>
    </el-select>
    <br>
    <span>Select the number of sessions for payment plan</span>
    <br>
    <el-select v-model="lessonAddingToSessions" placeholder="Select">
      <el-option v-for="item in sessionOptions" :key="item" :label="item" :value="item"></el-option>
    </el-select>
    <br>
    <div v-if="!lessonAddingToUnlimited">
      <span>Select the timeslot to add the student into</span>
      <br>
      <el-select v-model="lessonAddingToTimeslot" placeholder="Select">
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
      <day-selector v-model="lessonAddingToDay"></day-selector>
    </div>
    <br>
    <span>Unlimited?</span>
    <el-checkbox v-model="lessonAddingToUnlimited"></el-checkbox>
    <span slot="footer">
      <el-button type="primary" @click="addUserToLesson">Add</el-button>
      <el-button @click="closeDialog">Cancel</el-button>
    </span>
  </el-dialog>
</template>

<script>
import moment from "moment"
import _ from "lodash"
import { UNLIMITED } from "@/common/data"
import DaySelector from "@/components/utils/DaySelector"

export default {
  components: {
    DaySelector,
  },
  data() {
    return {
      lessonAddingTo: "",
      lessonAddingToDay: "",
      lessonAddingToSessions: "",
      lessonAddingToTimeslot: "",
      lessonAddingToUnlimited: "",
      sessionOptions: [4, 12, 24],
    }
  },
  computed: {
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
  methods: {
    async addUserToLesson() {
      let payload
      if (this.lessonAddingToUnlimited) {
        payload = {
          userIdsSessions: [
            //take note the S after userId
            {
              userId: this.userId,
              sessions: this.lessonAddingToSessions,
              timeslot: UNLIMITED,
            },
          ],
          lessonId: this.lessonAddingTo,
        }
      } else {
        payload = {
          userIdsSessions: [
            //take note the S after userId
            {
              userId: this.userId,
              sessions: this.lessonAddingToSessions,
              timeslot: this.lessonAddingToTimeslot,
              day: this.lessonAddingToDay,
            },
          ],
          lessonId: this.lessonAddingTo,
        }
      }

      await this.$store.dispatch("addUsersToLesson", payload)
      this.closeDialog()
    },
  },
  props: {
    closeDialog: {
      type: Function,
      required: true,
    },
    dialogVisible: {
      type: Boolean,
      required: true,
    },
    lessonData: {
      type: Array,
      required: true,
    },
    userId: {
      type: String,
    },
  },
}
</script>

<style>
</style>
