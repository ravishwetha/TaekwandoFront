<template>
  <el-container>
    <el-main>
      <div id="lessonAndDate">
        <div>
          <lesson-selector style="padding-right: 20px;" v-model="selectedLessonId"></lesson-selector>
          <date-selector v-model="dateRange"></date-selector>
        </div>
        <div id="headerDiv">
          <el-button @click="routeToAttendancePage()" type="primary" round>Take attendance</el-button>
          <el-button @click="routeToAddUser()" type="primary" round>Add user</el-button>
          <el-button @click="routeToAddLesson()" type="primary" round>Add lesson</el-button>
          <el-button @click="message.messageModalVisible = true" type="primary" round>Send a message</el-button>
        </div>
      </div>
      <el-input id="searchBar" v-model="searchString" placeholder="Search by name"></el-input>
      <el-table v-loading="isLoading" stripe max-height="730" :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="Name"></el-table-column>
        <el-table-column prop="presentCount" label="Total Present Count"></el-table-column>
        <el-table-column prop="lastPayment" label="Last Payment"></el-table-column>
        <el-table-column label="Operations" fixed="right">
          <template slot-scope="scope">
            <el-button @click="routeToUserDetails(scope.row)" type="text" size="small">Details</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="branch" label="Branch"></el-table-column>
      </el-table>
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
import LessonSelector from "@/components/lessons/LessonSelector"
import DateSelector from "@/components/utils/DateSelector"
import { emailAPI, smsAPI } from "@/common/api"

const moment = extendMoment(Moment)
export default {
  name: "AttendancePage",
  beforeCreate: async function() {
    await this.$store.dispatch("loadStudentsData")
    await this.$store.dispatch("loadLessonsData")
  },
  components: {
    LessonSelector,
    DateSelector,
  },
  computed: {
    tableData() {
      let filteredData = _.filter(
        this.$store.getters.getAllStudentsInfo,
        (user) =>
          _.includes(user.name.toUpperCase(), this.searchString.toUpperCase())
      )

      if (this.dateRange.length > 0 && !this.dateRange[0].isSame(moment(0))) {
        const startDate = this.dateRange[0]
        const endDate = this.dateRange[1]
        const selectionRange = moment.range(startDate, endDate)
        filteredData = _.filter(filteredData, (user) => {
          for (const attendance of _.values(user.attendance)) {
            return selectionRange.contains(moment(attendance.timestamp))
          }
          return false
        })
      }
      if (this.selectedLessonId) {
        filteredData = _.filter(filteredData, (user) => {
          return _.includes(
            _.values(user.attendance).map(
              (attendanceObject) => attendanceObject.lessonId
            ),
            this.selectedLessonId
          )
        })
      }
      filteredData = _.map(filteredData, (data) => ({
        ...data,
        branch: "Haig Branch",
      }))
      return filteredData
    },
    lessonData() {
      return [
        { name: "All lessons", id: "" },
        ...this.$store.getters.getAllLessonData,
      ]
    },
    isLoading() {
      return this.$store.getters.getStudentDataLoading
    },
  },
  methods: {
    async sendAMessage() {
      const studentData = this.tableData.map((student) => ({
        email: student.email,
        contact: student.contact,
      }))
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
    routeToUserDetails(val) {
      this.$router.push({
        name: "userDetails",
        query: {
          userId: val.userId,
          dateRange: this.dateRange.map((date) => date.toISOString()),
          selectedLessonId: this.selectedLessonId,
        },
      })
    },
    routeToAttendancePage() {
      this.$router.push({
        name: "attendance",
      })
    },
    routeToAddLesson() {
      this.$router.push("newLesson")
    },
    routeToAddUser() {
      this.$router.push({
        name: "signup",
      })
    },
  },
  data() {
    return {
      searchString: "",
      selectedLessonId: "",
      dateRange: [],
      message: {
        messageModalVisible: false,
        sendEmail: false,
        sendSMS: false,
        messageText: "",
      },
      sending: false,
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
