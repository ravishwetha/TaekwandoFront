<template>
  <el-container>
    <el-header>
      <div id="headerDiv">
        <el-button @click="routeToAttendancePage()" type="primary" round>Take attendance</el-button>
        <el-button @click="routeToAddUser()" type="primary" round>Add user</el-button>
        <el-button @click="routeToAddLesson()" type="primary" round>Add lesson</el-button>
      </div>
    </el-header>
    <el-main>
      <div class="lessonAndDate">
        <lesson-selector v-model="selectedLessonId"></lesson-selector>
        <date-selector v-model="dateRange"></date-selector>
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
      </el-table>
    </el-main>
  </el-container>
</template>

<script>
import _ from "lodash"
import Moment from "moment"
import { extendMoment } from "moment-range"
import LessonSelector from "@/components/lessons/LessonSelector"
import DateSelector from "@/components/utils/DateSelector"

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
    routeToUserDetails(val) {
      this.$router.push({
        name: "userDetails",
        query: {
          userId: val.userId,
          filters: {
            dateRange: this.dateRange.map((date) => date.toISOString()),
            selectedLessonId: this.selectedLessonId,
          },
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
    }
  },
}
</script>

<style scoped>
.lessonAndDate {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

#headerDiv {
  display: flex;
  justify-content: center;
}
</style>
