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
                @change="updatePresentAbsent"
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
            </el-col>
            <el-col span="6">
              <el-button
                id="newStudentDiv"
                type="primary"
                @click="modalVisible = true"
                :disabled="lessonValue === ``"
              >Make up</el-button>
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
    <el-dialog center width="70%" :visible.sync="modalVisible" title="Add attendance for users">
      <div id="addStudentTransferDiv">
        <el-transfer
          id="addStudentTransfer"
          v-model="studentsAddedToLesson"
          :data="studentData"
          :titles="['Unassigned', 'Present']"
        ></el-transfer>
      </div>
      <span slot="footer">
        <el-button @click="takeAttendanceUserNotInLesson" type="primary">Take attendance</el-button>
        <el-button @click="modalVisible = false">Cancel</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import moment from "moment"
import _ from "lodash"
import { DAYS, PRESENT, ABSENT } from "@/common/data"
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
            return true
          }
        }
      })
      const parsedData = _.map(data, (lesson, id) => ({ ...lesson, id }))
      return parsedData
    },
    tableData() {
      const filteredStudentInfo = _.filter(
        this.$store.getters.getAllStudentsInfo,
        (student) => {
          return _.includes(_.keys(student.lessons), this.lessonValue)
        }
      )
      return filteredStudentInfo
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
      lessonValue: "",
      total: 0,
      modalVisible: false,
      studentsAddedToLesson: [],
      present,
      absent,
      toBeUpdated: {},
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
      this.modalVisible = false
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
      const absenteeNumbers = _.map(absent, (absentee) => {
        const details = this.$store.getters.getStudentInfo(absentee.userId)
        return details.contact
      })
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
