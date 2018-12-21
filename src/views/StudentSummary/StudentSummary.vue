<template>
  <el-container>
    <el-main>
      <div id="lessonAndDate">
        <div>
          <span>Select lesson type</span>
          <br>
          <lesson-selector style="padding-right: 20px;" v-model="selectedLessonId"></lesson-selector>
        </div>
        <div>
          <span>Select dates here to filter the students</span>
          <br>
          <date-selector v-model="dateRange"></date-selector>
        </div>
      </div>
      <student-summary-header-buttons
        style="margin-bottom: 10px"
        :openSendMessageModal="openSendMessageModal"
      ></student-summary-header-buttons>
      <el-input id="searchBar" v-model="searchString" placeholder="Search by name"></el-input>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="Current" :name="ACTIVE">
          <student-summary-table-current
            :selectedLessonId="selectedLessonId"
            v-model="tableData"
            :dateRange="dateRange"
          ></student-summary-table-current>
        </el-tab-pane>
        <el-tab-pane label="Trial" :name="TRIAL">
          <student-summary-table-trial
            :selectedLessonId="selectedLessonId"
            v-model="tableData"
            :dateRange="dateRange"
          ></student-summary-table-trial>
        </el-tab-pane>
        <el-tab-pane label="Terminated" :name="TERMINATED">
          <student-summary-table-terminated
            :selectedLessonId="selectedLessonId"
            v-model="tableData"
            :dateRange="dateRange"
          ></student-summary-table-terminated>
        </el-tab-pane>
      </el-tabs>
    </el-main>
    <el-dialog
      :show-close="!this.sending"
      :close-on-click-modal="!this.sending"
      :close-on-press-escape="this.sending"
      title="Send SMS or Email"
      :visible.sync="message.messageModalVisible"
      width="50%"
    >
      <div style="padding-bottom: 20px">
        <el-checkbox v-model="message.sendEmail">Send email</el-checkbox>
        <el-checkbox v-model="message.sendSMS">Send SMS</el-checkbox>
      </div>
      <el-input type="textarea" v-model="message.messageText"></el-input>
      <div style="display: flex; justify-content: center; margin-top: 20px">
        <el-transfer
          id="addStudentTransfer"
          filterable
          filter-placeholder="Student Name"
          v-model="studentsToSendMessageTo"
          :data="studentData"
          :titles="['Unassigned', 'To Send']"
        ></el-transfer>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button v-if="!this.sending" @click="message.messageModalVisible = false">Cancel</el-button>
        <el-button :loading="this.sending" type="primary" @click="sendAMessage()">
          <span v-if="this.sending">Sending</span>
          <span v-else>Confirm</span>
        </el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
import _ from "lodash"
import Moment from "moment"
import { extendMoment } from "moment-range"
const moment = extendMoment(Moment)
import LessonSelector from "@/components/lessons/LessonSelector"
import DateSelector from "@/components/utils/DateSelector"
import StudentSummaryHeaderButtons from "./StudentSummaryHeaderButtons"
import StudentSummaryTableCurrent from "./StudentSummaryTableCurrent"
import StudentSummaryTableTerminated from "./StudentSummaryTableTerminated"
import StudentSummaryTableTrial from "./StudentSummaryTableTrial"

import { emailAPI, smsAPI } from "@/common/api"
import { ACTIVE, TRIAL, TERMINATED } from "@/common/data"

export default {
  name: "AttendancePage",
  beforeMount: async function() {
    await this.$store.dispatch("loadStudentsData")
    await this.$store.dispatch("loadLessonsData")
    await this.$store.dispatch("loadPriceList")
  },
  components: {
    LessonSelector,
    DateSelector,
    StudentSummaryHeaderButtons,
    StudentSummaryTableCurrent,
    StudentSummaryTableTerminated,
    StudentSummaryTableTrial,
  },
  computed: {
    lessonData() {
      return this.$store.getters.getAllLessonData
    },
    studentData() {
      return _.map(this.$store.getters.getAllStudentsInfo, (studentInfo) => {
        return {
          key: studentInfo.userId,
          label: studentInfo.name,
        }
      })
    },
    tableData() {
      let filteredData = _.filter(
        this.$store.getters.getAllStudentsInfo,
        (user) =>
          _.includes(user.name.toUpperCase(), this.searchString.toUpperCase())
      )

      if (
        this.dateRange !== null &&
        !moment(this.dateRange[0]).isSame(moment(0))
      ) {
        const startDate = this.dateRange[0]
        const endDate = this.dateRange[1]
        const selectionRange = moment.range(startDate, endDate)
        filteredData = _.filter(filteredData, (user) => {
          for (const attendance of _.values(user.attendance)) {
            return selectionRange.contains(moment(attendance.timestamp))
          }
          return false
        })
        filteredData = _.map(filteredData, (user) => {
          let presentCount = 0
          _.values(user.attendance).forEach((attendance) => {
            if (selectionRange.contains(moment(attendance.timestamp))) {
              presentCount++
            }
          })
          return { ...user, presentCount }
        })
      }
      if (
        this.selectedLessonId.length !== 0 &&
        this.selectedLessonId !== undefined
      ) {
        filteredData = _.filter(filteredData, (user) => {
          return _.includes(_.keys(user.lessons), _.last(this.selectedLessonId))
        })
        filteredData = _.filter(filteredData, (user) => {
          return (
            user.lessons[_.last(this.selectedLessonId)].day ===
            _.head(this.selectedLessonId)
          )
        })
      }
      filteredData = _.map(filteredData, (data) => {
        let parsedData = {
          ...data,
          branch: "Haig Branch",
        }
        if (data.terminatedTime) {
          parsedData = {
            ...parsedData,
            terminatedTime: moment(parsedData.terminatedTime).format(
              "DD-MM-YYYY"
            ),
          }
        }
        return parsedData
      })

      filteredData = _.filter(
        filteredData,
        (user) => user.status === this.activeTab
      )

      return filteredData
    },
  },
  methods: {
    async sendAMessage() {
      const studentData = this.studentsToSendMessageTo.map((student) => {
        const { email, contact } = this.$store.getters.getStudentInfo(student)
        return { email, contact }
      })
      this.sending = true
      if (this.message.sendEmail) {
        try {
          await emailAPI({
            studentData,
            messageText: this.message.messageText,
          })
          this.$notify({
            title: "Message sent",
            message: "Email has been sent.",
          })
        } catch (e) {
          this.$notify({
            title: "Email failed",
            message: "Email failed to send.",
            type: "error",
          })
        }
      }
      //TODO: refactor
      if (this.message.sendSMS) {
        try {
          await smsAPI({
            studentData,
            messageText: this.message.messageText,
          })
          this.$notify({
            title: "Message sent",
            message: "SMS has been sent.",
          })
        } catch (e) {
          this.$notify({
            title: "SMS failed",
            message: "SMS failed to send.",
            type: "error",
          })
        }
      }
      this.sending = false
      this.message.messageModalVisible = false
    },
    openSendMessageModal() {
      this.message.messageModalVisible = true
    },
  },
  data() {
    return {
      searchString: "",
      activeTab: ACTIVE,
      selectedLessonId: [],
      dateRange: null,
      message: {
        messageModalVisible: false,
        sendEmail: false,
        sendSMS: false,
        messageText: "",
      },
      sending: false,
      ACTIVE,
      TRIAL,
      TERMINATED,
      studentsToSendMessageTo: [],
    }
  },
}
</script>

<style scoped>
#lessonAndDate {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

#headerDiv {
  display: flex;
  justify-content: center;
}
</style>
