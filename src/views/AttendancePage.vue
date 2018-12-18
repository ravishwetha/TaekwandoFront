<template>
  <div>
    <el-container>
      <el-header>
        <div id="header">
          <span id="date">{{selectedDate}}</span>
        </div>
      </el-header>
      <el-main>
        <hr>
        <el-col id="center">
          <el-row :gutter="10">
            <el-col span="6">
              <el-select
                style="padding-bottom: 10px"
                v-model="lessonValue"
                placeholder="Select lesson"
              >
                <el-option
                  v-for="lesson in lessonData"
                  :key="lesson.id"
                  :label="lesson.name"
                  :value="lesson.id"
                ></el-option>
              </el-select>
              <br>
              <el-select v-model="selectedTimeslot" placeholder="Select timeslot">
                <el-option
                  v-for="item in timeslotSelectData"
                  :key="item.val"
                  :label="item.label"
                  :value="item.val"
                ></el-option>
              </el-select>
            </el-col>
            <el-col span="6">
              <el-button
                id="newStudentDiv"
                type="primary"
                @click="makeupModalVisible = true"
                :disabled="lessonValue === ``"
              >Make up</el-button>
              <el-button
                id="newStudentDiv"
                type="primary"
                @click="viewMakeUpModalVisible = true"
                :disabled="lessonValue === ``"
              >View make up students</el-button>
            </el-col>
            <el-col id="presentAbsent" span="6">
              <span>Present count : {{presentCount}} / {{tableData.length}}</span>
            </el-col>
            <el-col id="presentAbsent" span="6">
              <span>Absent count : {{absentCount}} / {{tableData.length}}</span>
            </el-col>
          </el-row>
        </el-col>
        <hr>
        <el-table
          max-height="530"
          :empty-text="emptyTableText"
          :data="tableData"
          style="width: 100%"
        >
          <el-table-column prop="name" label="Name"></el-table-column>
          <el-table-column label="Present">
            <template slot-scope="scope">
              <el-checkbox
                v-model="present[scope.row.userId]"
                @change="(change) => change ? untickAbsent(scope.row.userId) : null"
                label="Present"
              ></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="Absent">
            <template slot-scope="scope">
              <el-checkbox
                v-model="absent[scope.row.userId]"
                @change="(change) => change ? untickPresent(scope.row.userId) : null"
                label="Absent"
              ></el-checkbox>
            </template>
          </el-table-column>
        </el-table>
        <div style="text-align: center; padding-top: 30px;">
          <el-button @click="submitAttendance" type="primary">Submit</el-button>
        </div>
      </el-main>
    </el-container>
    <el-dialog
      title="Users who attended this lesson's makeup"
      center
      :visible.sync="viewMakeUpModalVisible"
    >
      <el-table :data="makeupLessonUserData" style="width: 100%">
        <el-table-column prop="name" label="Name"></el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog
      center
      width="70%"
      :visible.sync="makeupModalVisible"
      title="Add attendance for users"
    >
      <div id="addStudentTransferDiv">
        <el-transfer
          id="addStudentTransfer"
          filterable
          filter-placeholder="Student Name"
          v-model="studentsAddedToLesson"
          :data="studentData"
          :titles="['Unassigned', 'Present']"
        ></el-transfer>
      </div>
      <span slot="footer">
        <el-button @click="takeAttendanceUserNotInLesson" type="primary">Take attendance</el-button>
        <el-button @click="makeupModalVisible = false">Cancel</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import moment from "moment"
import _ from "lodash"
import { DAYS, PRESENT, ABSENT, UNLIMITED } from "@/common/data"
import { absentSmsAPI } from "@/common/api"
import Vue from "vue"

export default {
  beforeMount() {
    this.updatePresentAbsent()
  },
  computed: {
    lessonData() {
      const data = _.omitBy(this.$store.getters.getAllLessonData, (lesson) => {
        for (const day of lesson.days) {
          if (moment().day() === DAYS[day]) {
            return false
          }
        }
        return true
      })
      const parsedData = _.map(data, (lesson, id) => ({ ...lesson, id }))

      return parsedData
    },
    makeupLessonUserData() {
      const users = this.$store.getters.getAllStudentsInfo
      const usersWhoHaveAttendance = _.compact(
        _.map(
          users,
          (userData, userId) =>
            userData.attendance
              ? { userId, name: userData.name, attendance: userData.attendance }
              : null
        )
      )
      const usersWhoHaveMakeupTodayInThisLesson = _.filter(
        usersWhoHaveAttendance,
        (idNameAttendance) => {
          const todayMakeup = _.find(
            idNameAttendance.attendance,
            (attendanceObject) => {
              const sameId = attendanceObject.lessonId === this.lessonValue
              const sameDay = moment(attendanceObject.timestamp)
                .startOf("day")
                .isSame(moment().startOf("day"))
              const isMakeup = attendanceObject.presence === "MAKEUP"
              return sameId && sameDay && isMakeup
            }
          )
          return todayMakeup !== undefined
        }
      )
      return usersWhoHaveMakeupTodayInThisLesson
    },
    tableData() {
      let filteredStudentInfo = _.filter(
        this.$store.getters.getAllStudentsInfo,
        (student) => {
          return _.includes(_.keys(student.lessons), this.lessonValue)
        }
      )
      filteredStudentInfo = _.filter(filteredStudentInfo, (user) => {
        return (
          DAYS[user.lessons[this.lessonValue].day] === moment().day() ||
          user.lessons[this.lessonValue].timeslot === UNLIMITED
        )
      })
      filteredStudentInfo = _.filter(filteredStudentInfo, (user) => {
        return (
          user.lessons[this.lessonValue].timeslot === this.selectedTimeslot ||
          user.lessons[this.lessonValue].timeslot === UNLIMITED
        )
      })
      this.updatePresentAbsent()
      return filteredStudentInfo
    },
    timeslotSelectData() {
      const selectOptions = _.map(
        this.getStudentUniqueTimeslots(),
        (timeslot) => {
          const [from, to] = timeslot.split("/")
          const parsedFrom = moment(from).format("ha")
          const parsedTo = moment(to).format("ha")
          return { label: parsedFrom + "-" + parsedTo, val: timeslot }
        }
      )
      return selectOptions
    },
    studentData() {
      const filteredStudentInfo = _.filter(
        this.$store.getters.getAllStudentsInfo,
        (student) => !_.includes(student.lessons, this.lessonValue)
      )
      return _.map(filteredStudentInfo, (studentInfo) => {
        return {
          key: studentInfo.userId,
          label: studentInfo.name,
        }
      })
    },
    emptyTableText() {
      if (this.lessonValue === "") {
        return "Please select a lesson"
      }
      return "There are no users in this lesson. Add one?"
    },
    presentCount() {
      return _.filter(this.present, (present) => present === true).length
    },
    absentCount() {
      return _.filter(this.absent, (absent) => absent === true).length
    },
  },
  data() {
    let present = {}
    let absent = {}

    return {
      selectedDate: moment().format("DD MMM YYYY"),
      selectedTimeslot: "",
      lessonValue: "",
      total: 0,
      makeupModalVisible: false,
      studentsAddedToLesson: [],
      present,
      absent,
      toBeUpdated: {},
      viewMakeUpModalVisible: false,
    }
  },
  methods: {
    updatePresentAbsent() {
      _.forEach(this.$store.getters.getAllStudentsInfo, (student) => {
        _.forEach(student.attendance, (lessonsAttended, key) => {
          if (
            moment(lessonsAttended.timestamp)
              .startOf("day")
              .isSame(moment().startOf("day")) &&
            (this.lessonValue && lessonsAttended.lessonId === this.lessonValue)
          ) {
            if (lessonsAttended.presence === PRESENT) {
              Vue.set(this.present, student.userId, true)
              this.toBeUpdated[student.userId] = key
            }
            if (lessonsAttended.presence === ABSENT) {
              Vue.set(this.absent, student.userId, true)
              this.toBeUpdated[student.userId] = key
            }
          }
        })
      })
    },
    getStudentUniqueTimeslots() {
      let filteredStudentInfo = _.filter(
        this.$store.getters.getAllStudentsInfo,
        (student) => {
          return _.includes(_.keys(student.lessons), this.lessonValue)
        }
      )
      filteredStudentInfo = _.filter(filteredStudentInfo, (user) => {
        return (
          DAYS[user.lessons[this.lessonValue].day] === moment().day() ||
          user.lessons[this.lessonValue].timeslot === UNLIMITED
        )
      })
      const timeslots = new Set()
      filteredStudentInfo.forEach((user) => {
        timeslots.add(user.lessons[this.lessonValue].timeslot)
      })
      return Array.from(timeslots)
    },
    untickAbsent(id) {
      this.absent[id] = false
    },
    untickPresent(id) {
      this.present[id] = false
    },
    routeToAddLesson() {
      this.$router.push("newLesson")
    },
    routeToAddUser() {
      this.$router.push({
        name: "userDetails",
        query: { userId: "NEW" },
      })
    },
    takeAttendanceUserNotInLesson() {
      const userIdAndPresence = _.map(this.studentsAddedToLesson, (userId) => ({
        userId: userId,
        presence: "MAKEUP",
      }))
      this.$store.dispatch("submitAttendance", {
        userIdsAndPresence: userIdAndPresence,
        lessonId: this.lessonValue,
        studentsToBeUpdated: this.toBeUpdated,
      })
      this.makeupModalVisible = false
    },
    submitAttendance() {
      const present = _.compact(
        _.map(this.present, (value, key) => {
          if (value) {
            return {
              userId: key,
              presence: PRESENT,
            }
          }
          return null
        })
      )
      const absent = _.compact(
        _.map(this.absent, (value, key) => {
          if (value) {
            return {
              userId: key,
              presence: ABSENT,
            }
          }
          return null
        })
      )
      const absenteeNumbers = _.compact(
        _.map(absent, (absentee) => {
          if (_.includes(_.keys(this.toBeUpdated), absentee.userId)) {
            return null
          }
          const details = this.$store.getters.getStudentInfo(absentee.userId)
          return _.get(details, "contact", null)
        })
      )
      this.$store.dispatch("submitAttendance", {
        userIdsAndPresence: present.concat(absent),
        lessonId: this.lessonValue,
        studentsToBeUpdated: this.toBeUpdated,
      })
      absentSmsAPI({ absenteeNumbers })
      this.$router.push({
        name: "home",
      })
    },
  },
}
</script>

<style scoped>
#center {
  padding-top: 50px;
  padding-bottom: 50px;
}

#presentAbsent {
  margin-top: 20px;
}

#addStudentTransferDiv {
  display: flex;
  justify-content: center;
}
</style>
