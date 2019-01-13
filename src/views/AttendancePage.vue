<template>
  <div>
    <el-container>
      <el-header>
        <div id="header">
          <date-selector v-model="selectedDate" single></date-selector>
        </div>
      </el-header>
      <el-main>
        <hr>
        <el-col id="center">
          <el-row :gutter="10">
            <el-col :span="6">
              <el-select
                style="padding-bottom: 10px"
                value-key="key"
                @change="() => initializeAttendanceData(tableData)"
                v-model="lessonValue"
              >
                <el-option :key="1" label="Select a lesson" :value="null"></el-option>
                <el-option-group v-for="group in lessonData" :key="group.key" :label="group.label">
                  <el-option
                    v-for="item in group.options"
                    :key="item.key"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-option-group>
              </el-select>
            </el-col>
            <el-col style="display: flex; flex-direction: row" :span="10">
              <el-button
                id="newStudentDiv"
                type="primary"
                @click="makeupModalVisible = true"
                :disabled="lessonValue === ''"
              >Make up</el-button>
              <el-button
                id="newStudentDiv"
                type="primary"
                @click="viewMakeUpModalVisible = true"
                :disabled="lessonValue === ''"
              >View make up students</el-button>
              <el-button @click="() => allPresent(tableData)">All present</el-button>
              <el-button @click="() => allAbsent(tableData)">All absent</el-button>
            </el-col>
            <el-col
              style="display: flex; flex-direction: row; justify-content: space-between; margin-top: -5px"
              id="presentAbsent"
              :span="6"
            >
              <p>Present count : {{presentCount}} / {{tableData.length}}</p>
              <p>Absent count : {{absentCount}} / {{tableData.length}}</p>
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
          <el-table-column label="Taken by">
            <template slot-scope="scope">
              <p>{{takenBy[scope.row.userId]}}</p>
            </template>
          </el-table-column>
          <el-table-column label="Description">
            <template slot-scope="scope">
              <el-input v-model="description[scope.row.userId]"></el-input>
            </template>
          </el-table-column>
        </el-table>
        <div style="text-align: center; padding-top: 30px;">
          <el-button :loading="isSubmitting" @click="submitAttendance" type="primary">Submit</el-button>
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
        <el-table-column prop="timestamp" label="Taken at"></el-table-column>
        <el-table-column label="Operations" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="deleteMakeup(scope.row)">Delete</el-button>
          </template>
        </el-table-column>
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
import Vue from "vue"
import { DAYS, PRESENT, ABSENT, UNLIMITED, MAKEUP } from "@/common/data"
import { absentSmsAPI } from "@/common/api"
import {
  DATEANDTIME,
  readableTimeslotParser,
  englishTimeslotToMoment,
  getDayShort,
} from "@/common/dateUtils"
import { englishTimeslotInArray } from "@/common/findUtils"
import DateSelector from "@/components/utils/DateSelector"

export default {
  beforeMount() {
    this.updatePresentAbsent()
  },
  components: {
    DateSelector,
  },
  computed: {
    lessonData() {
      const todayLessons = this.$store.getters.getTodayLessons(
        getDayShort(this.selectedDate)
      )
      const todayLessonWithId = _.map(todayLessons, (lesson, id) => ({
        ...lesson,
        id,
      }))
      let timeslotObject = {}

      // Get timeslot as keys
      _.forEach(todayLessonWithId, (lesson) => {
        const lessonTimeslots = this.$store.getters.getLessonDayTimeslotsKeyedByDay(
          lesson.id
        )[getDayShort(this.selectedDate)]
        _.forEach(
          lessonTimeslots,
          (timeslot) =>
            (timeslotObject[readableTimeslotParser(timeslot)] = {
              label: readableTimeslotParser(timeslot),
              options: [],
            })
        )
        return null
      })
      const timeslotToStudents = this.getTimeslotsToStudents()

      // Today lesson which has a certain timeslot
      _.forEach(timeslotObject, (object, timeslot) => {
        _.forEach(todayLessonWithId, (lesson) => {
          const lessonTimeslots = this.$store.getters.getLessonDayTimeslotsKeyedByDay(
            lesson.id
          )[getDayShort(this.selectedDate)]

          if (englishTimeslotInArray(lessonTimeslots, timeslot)) {
            timeslotObject[timeslot].options.push({
              label: `${lesson.name} (${
                timeslotToStudents[timeslot]
                  ? timeslotToStudents[timeslot].length
                  : 0
              })`,
              value: {
                lessonId: lesson.id,
                timeslot,
                key: Math.random(),
              },
              key: Math.random(),
            })
          }
        })
      })
      const timeslotOptions = _.values(timeslotObject)

      const sortedTimeslotOptions = _.sortBy(timeslotOptions, (option) => {
        const { from } = englishTimeslotToMoment(option.label)
        return from.unix()
      })

      return sortedTimeslotOptions
    },
    makeupLessonUserData() {
      const users = this.$store.getters.getAllStudentsInfo
      const usersWhoHaveAttendance = _.compact(
        _.map(
          users,
          (userData) =>
            userData.attendance
              ? {
                  userId: userData.userId,
                  name: userData.name,
                  attendance: userData.attendance,
                }
              : null
        )
      )
      const usersWhoHaveMakeupTodayInThisLesson = _.filter(
        usersWhoHaveAttendance,
        (idNameAttendance) => {
          const todayMakeup = _.find(
            idNameAttendance.attendance,
            (attendanceObject) => {
              const sameId =
                attendanceObject.lessonId === this.lessonValue.lessonId
              const sameDay = moment(attendanceObject.dateOfLesson)
                .startOf("day")
                .isSame(moment(this.selectedDate).startOf("day"))
              const isMakeup = attendanceObject.presence === MAKEUP
              return sameId && sameDay && isMakeup
            }
          )
          return todayMakeup !== undefined
        }
      )
      const mostRecentMakeupMap = _.map(
        usersWhoHaveMakeupTodayInThisLesson,
        (userAttendance) => {
          const { attendance } = userAttendance
          const attendanceWithId = _.map(attendance, (attendance, id) => ({
            ...attendance,
            id,
          }))
          const todayMakeupAttendance = _.find(
            attendanceWithId,
            (attendanceObject) => {
              const sameId =
                attendanceObject.lessonId === this.lessonValue.lessonId
              const sameDay = moment(attendanceObject.dateOfLesson)
                .startOf("day")
                .isSame(moment(this.selectedDate).startOf("day"))
              const isMakeup = attendanceObject.presence === MAKEUP
              return sameId && sameDay && isMakeup
            }
          )
          return {
            ...userAttendance,
            attendanceToDelete: todayMakeupAttendance,
            timestamp: moment(todayMakeupAttendance.timestamp).format(
              DATEANDTIME
            ),
          }
        }
      )
      return mostRecentMakeupMap
    },
    tableData() {
      const { lessonId, timeslot } = this.lessonValue
      let filteredStudentInfo = _.filter(
        this.$store.getters.getAllStudentsInfo,
        (student) => {
          return _.includes(_.keys(student.lessons), lessonId)
        }
      )
      filteredStudentInfo = _.filter(filteredStudentInfo, (user) => {
        return (
          user.lessons[lessonId].timeslot === UNLIMITED ||
          DAYS[user.lessons[lessonId].day] === moment(this.selectedDate).day()
        )
      })
      filteredStudentInfo = _.filter(filteredStudentInfo, (user) => {
        return (
          user.lessons[lessonId].timeslot === UNLIMITED ||
          _.includes(
            timeslot,
            readableTimeslotParser(user.lessons[lessonId].timeslot)
          )
        )
      })
      return filteredStudentInfo
    },
    studentData() {
      const filteredStudentInfo = _.filter(
        this.$store.getters.getAllStudentsInfo,
        (student) =>
          _.includes(_.keys(student.lessons), this.lessonValue.lessonId)
      )
      return _.compact(
        _.map(filteredStudentInfo, (studentInfo) => {
          const alreadyMadeUpToday = _.find(
            _.values(studentInfo.attendance),
            (attendance) => {
              return (
                moment(attendance.timestamp)
                  .startOf("day")
                  .isSame(moment(this.selectedDate).startOf("day")) &&
                attendance.presence == MAKEUP &&
                attendance.lessonId == this.lessonValue.lessonId
              )
            }
          )
          if (alreadyMadeUpToday) {
            return null
          }
          return {
            key: studentInfo.userId,
            label: studentInfo.name,
          }
        })
      )
    },
    emptyTableText() {
      if (this.lessonValue === null) {
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
    return {
      selectedDate: moment(),
      lessonValue: "",
      makeupModalVisible: false,
      studentsAddedToLesson: [],
      present: {},
      absent: {},
      description: {},
      takenBy: {},
      modifiedBy: {},
      toBeUpdated: {},
      viewMakeUpModalVisible: false,
      isSubmitting: false,
    }
  },
  methods: {
    initializePresentAbsent(filteredStudentInfo) {
      filteredStudentInfo.forEach((user) => {
        Vue.set(this.present, user.userId, false)
        Vue.set(this.absent, user.userId, false)
      })
    },
    updatePresentAbsent() {
      this.present = {}
      this.absent = {}
      const { lessonId } = this.lessonValue
      _.forEach(this.$store.getters.getAllStudentsInfo, (student) => {
        _.forEach(student.attendance, (lessonsAttended, key) => {
          if (
            (lessonsAttended.dateOfLesson
              ? moment(lessonsAttended.dateOfLesson)
                  .startOf("day")
                  .isSame(moment(this.selectedDate).startOf("day"))
              : moment(lessonsAttended.timestamp)
                  .startOf("day")
                  .isSame(moment(this.selectedDate).startOf("day"))) &&
            lessonsAttended.lessonId === lessonId &&
            this.$store.getters.studentInLesson(lessonId, student.userId) &&
            lessonsAttended.timeslot === this.lessonValue.timeslot
          ) {
            if (lessonsAttended.presence === PRESENT) {
              Vue.set(this.present, student.userId, true)
              this.toBeUpdated[student.userId] = {
                attendanceId: key,
                previous: PRESENT,
              }
            }
            if (lessonsAttended.presence === ABSENT) {
              Vue.set(this.absent, student.userId, true)
              this.toBeUpdated[student.userId] = {
                attendanceId: key,
                previous: ABSENT,
              }
            }
            if (lessonsAttended.description) {
              this.description[student.userId] = lessonsAttended.description
            }
            if (lessonsAttended.takenBy) {
              this.takenBy[student.userId] = lessonsAttended.takenBy
            }
          }
        })
      })
    },
    initializeAttendanceData(tableData) {
      this.initializePresentAbsent(tableData)
      this.updatePresentAbsent()
    },
    getTimeslotsToStudents() {
      // Gets all students with lessons today or unlimited timeslots
      let filteredStudentInfo = _.filter(
        this.$store.getters.getAllStudentsInfo,
        (student) => {
          return _.find(_.values(student.lessons), (lesson) => {
            return moment(this.selectedDate).day() === DAYS[lesson.day] ||
              lesson.timeslot === UNLIMITED
              ? true
              : false
          })
        }
      )
      // Today's day in 3 letter string
      const todayDay = getDayShort(this.selectedDate)

      const timeslots = {}
      filteredStudentInfo.forEach((user) => {
        _.forEach(user.lessons, (lesson, lessonId) => {
          if (lesson.timeslot === UNLIMITED) {
            const todayTimeslots = _.get(
              this.$store.getters.getLessonDayTimeslotsKeyedByDay(lessonId),
              todayDay,
              []
            )
            todayTimeslots.forEach((timeslot) => {
              //Check if its already added
              const englishTimeslot = readableTimeslotParser(timeslot)

              if (timeslots[englishTimeslot] === undefined) {
                timeslots[englishTimeslot] = []
              }
              timeslots[englishTimeslot].push(user)
            })
          } else {
            if (lesson.day === todayDay) {
              const englishTimeslot = readableTimeslotParser(lesson.timeslot)
              if (timeslots[englishTimeslot] === undefined) {
                timeslots[englishTimeslot] = []
              }
              timeslots[englishTimeslot].push(user)
            }
          }
        })
      })
      return timeslots
    },
    deleteMakeup(row) {
      const { userId, attendanceToDelete } = row
      this.$store.dispatch("deleteMakeupAttendance", {
        userId,
        attendanceId: attendanceToDelete.id,
      })
    },

    untickAbsent(id) {
      this.absent[id] = false
    },
    untickPresent(id) {
      this.present[id] = false
    },
    allPresent(tableData) {
      tableData.forEach((data) => {
        this.untickAbsent(data.userId)
        this.$set(this.present, data.userId, true)
      })
    },
    allAbsent(tableData) {
      tableData.forEach((data) => {
        this.untickPresent(data.userId)
        this.$set(this.absent, data.userId, true)
      })
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
        presence: MAKEUP,
        dateOfLesson: moment(this.selectedDate).toISOString(),
        timeslot: this.lessonValue.timeslot,
      }))
      this.$store.dispatch("submitAttendance", {
        userIdsAndPresence: userIdAndPresence,
        lessonId: this.lessonValue.lessonId,
        studentsToBeUpdated: this.toBeUpdated,
      })
      this.makeupModalVisible = false
    },
    async submitAttendance() {
      const present = _.compact(
        _.map(this.present, (value, key) => {
          if (value) {
            return {
              userId: key,
              presence: PRESENT,
              description: this.description[key],
              dateOfLesson: moment(this.selectedDate).toISOString(),
              timeslot: this.lessonValue.timeslot,
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
              description: this.description[key],
              dateOfLesson: moment(this.selectedDate).toISOString(),
              timeslot: this.lessonValue.timeslot,
            }
          }
          return null
        })
      )
      const absenteeNumbersAndNames = _.compact(
        _.map(absent, (absentee) => {
          if (_.includes(_.keys(this.toBeUpdated), absentee.userId)) {
            return null
          }
          const details = this.$store.getters.getStudentInfo(absentee.userId)
          return _.get(details, "contact", null) === null ||
            details.lessons[this.lessonValue.lessonId].timeslot === UNLIMITED
            ? null
            : { contact: _.get(details, "contact", null), name: details.name }
        })
      )
      await this.$store.dispatch("submitAttendance", {
        userIdsAndPresence: present.concat(absent),
        lessonId: this.lessonValue.lessonId,
        studentsToBeUpdated: this.toBeUpdated,
        vm: this,
      })
      absentSmsAPI({ absenteeNumbersAndNames })
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
