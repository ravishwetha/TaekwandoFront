<template>
    <div>
        <el-container>
            <el-header>
                <div id="header">
                    <span id="date">{{selectedDate}}</span>
                    <el-button type="primary" @click="routeToAddUser()">Add user</el-button>
                    <el-button type="primary" @click="routeToAddLesson()">Add lesson</el-button>
                </div>
            </el-header>
            <el-main>
                <hr>
                <el-col id="center">
                    <el-row :gutter="10">
                        <el-col span="6">
                            <el-select v-model="lessonValue" placeholder="Select lesson">
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
                            >Add a new student to class</el-button>
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
                            <el-checkbox v-model="present[scope.row.id]" label="Present"></el-checkbox>
                        </template>
                    </el-table-column>
                    <el-table-column label="Absent">
                        <template slot-scope="scope">
                            <el-checkbox v-model="absent[scope.row.id]" label="Absent"></el-checkbox>
                        </template>
                    </el-table-column>
                </el-table>
                <div style="text-align: center; padding-top: 30px;">
                    <el-button @click="submitAttendance" type="primary">Submit</el-button>
                </div>
            </el-main>
        </el-container>
        <el-dialog center width="70%" :visible.sync="modalVisible" title="Add users to lesson">
            <div id="addStudentTransferDiv">
                <el-transfer
                    id="addStudentTransfer"
                    v-model="studentsAddedToLesson"
                    :data="studentData"
                    :titles="['Unassigned', 'To be added']"
                ></el-transfer>
            </div>
            <span slot="footer">
                <el-button @click="addToLesson" type="primary">Add users to lesson</el-button>
                <el-button @click="modalVisible = false">Cancel</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import moment from "moment"
import _ from "lodash"
import { DAYS, PRESENT, ABSENT } from "@/common/data"
//TODO: Mutually exclude present and not present
export default {
  computed: {
    lessonData() {
      return _.filter(this.$store.getters.getLessonData, (lesson) => {
        for (const day of lesson.days) {
          if (moment().day() === DAYS[day]) {
            return true
          }
        }
      })
    },
    tableData() {
      const filteredStudentInfo = _.filter(
        this.$store.getters.getAllStudentsInfo,
        (student) => _.includes(student.lessons, this.lessonValue)
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
          key: studentInfo.id,
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
      return _.filter(this.present, (present) => present == true).length
    },
    absentCount() {
      return _.filter(this.absent, (absent) => absent == true).length
    },
  },
  data() {
    return {
      selectedDate: moment().format("DD MMM YYYY"),
      lessonValue: "",
      total: 0,
      modalVisible: false,
      studentsAddedToLesson: [],
      present: {},
      absent: {},
    }
  },
  methods: {
    routeToAddLesson() {
      this.$router.push("newLesson")
    },
    routeToAddUser() {
      this.$router.push({
        name: "userDetails",
        query: { userId: "NEW" },
      })
    },
    addToLesson() {
      this.$store.dispatch("addUsersToLesson", {
        userIds: this.studentsAddedToLesson,
        lessonId: this.lessonValue,
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
      this.$store.dispatch("submitAttendance", {
        userIdsAndPresence: present.concat(absent),
        lessonId: this.lessonValue,
      })

      this.$router.push({
        name: "home",
      })
    },
  },
}
</script>

<style scoped>
#header {
  display: flex;
  justify-content: space-evenly;
  padding-bottom: 20px;
  padding-top: 20px;
}

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
