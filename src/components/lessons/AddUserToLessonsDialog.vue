<template>
  <el-dialog title="Add student into lesson" :visible.sync="dialogVisible">
    <span>Select which lesson to add student into:</span>
    <br>
    <el-select v-model="lessonAddingTo" style="margin-top: 10px; margin-bottom: 10px;">
      <el-option
        v-for="lesson in lessonData"
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
      v-model="lessonAddingToSessions"
      placeholder="Select"
    >
      <el-option v-for="item in sessionOptions" :key="item" :label="item" :value="item"></el-option>
    </el-select>
    <br>
    <div v-if="!lessonAddingToUnlimited">
      <span>Select the day and timeslot to add the student into:</span>
      <br>
      <el-select
        style="margin-top: 10px; margin-bottom: 10px;"
        v-model="lessonAddingToDayTimeslot"
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
    </div>
    <br>
    <el-checkbox label="Unlimited?" v-model="lessonAddingToUnlimited"></el-checkbox>
    <span slot="footer">
      <el-button type="primary" @click="addUserToLesson">Add</el-button>
      <el-button @click="closeDialog">Cancel</el-button>
    </span>
  </el-dialog>
</template>

<script>
import _ from "lodash"
import { UNLIMITED } from "@/common/data"
import DateSelector from "@/components/utils/DateSelector"

import {
  getDayAndTimeslotFromDayTimeslot,
  readableTimeslotParser,
} from "@/common/dateUtils"

export default {
  components: {
    DateSelector,
  },
  data() {
    return {
      lessonAddingTo: "",
      lessonAddingToSessions: "",
      lessonAddingToDayTimeslot: "",
      lessonAddingToUnlimited: "",
      sessionOptions: [4, 12, 24],
    }
  },
  computed: {
    selectedLessonTimeslots() {
      const allLessonData = this.$store.getters.getAllLessonData
      const selectedLessonPayload = _.get(allLessonData, this.lessonAddingTo)

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
              timeslot: this.lessonAddingToDayTimeslot.timeslot,
              day: this.lessonAddingToDayTimeslot.day,
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
