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
      <div
        :key="JSON.stringify(dayTimeslot)+Math.random()"
        v-for="dayTimeslot in lessonAddingToDayTimeslots"
      >
        <el-select
          style="margin-top: 10px; margin-bottom: 10px;"
          v-model="dayTimeslot.dayAndTimeslot"
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
      <el-button @click="addDayTimeslot()">Add Day and Timeslot</el-button>
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
      lessonAddingToDayTimeslots: [
        {
          dayAndTimeslot: "",
        },
      ],
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
    removeDayTimeslot(dayTimeslot) {
      const index = this.lessonAddingToDayTimeslots.indexOf(dayTimeslot)
      if (index !== -1) {
        this.lessonAddingToDayTimeslots.splice(index, 1)
      }
    },
    addDayTimeslot() {
      this.lessonAddingToDayTimeslots.push({
        dayAndTimeslot: "",
      })
    },

    async addUserToLesson() {
      let payload
      if (this.lessonAddingToUnlimited) {
        payload = {
          userIdsSessions: [
            //take note the S after userId
            {
              userId: this.userId,
              sessions: this.lessonAddingToSessions,
              //To standardize
              timeslot: UNLIMITED,
            },
          ],
          lessonId: this.lessonAddingTo,
        }
      } else {
        const dayTimeslots = _.map(
          this.lessonAddingToDayTimeslots,
          (dayTimeslot) => _.omit(dayTimeslot.dayAndTimeslot, ["key"])
        )
        payload = {
          userIdsSessions: [
            //take note the S after userId
            {
              userId: this.userId,
              sessions: this.lessonAddingToSessions,
              dayTimeslots,
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
