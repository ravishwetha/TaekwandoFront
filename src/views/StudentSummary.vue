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
        <el-select v-model="selectedLessonId">
          <el-option v-for="item in lessonData" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
        <el-date-picker
          v-model="date"
          type="date"
          placeholder="Pick a day"
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </div>
      <el-input id="searchBar" v-model="searchString" placeholder="Search by name"></el-input>
      <el-table v-loading="isLoading" stripe max-height="730" :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="Name"></el-table-column>
        <el-table-column prop="attendance" label="Total Count"></el-table-column>
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
export default {
  name: "AttendancePage",
  beforeCreate: async function() {
    await this.$store.dispatch("loadStudentsData")
    await this.$store.dispatch("loadLessonsData")
  },
  computed: {
    tableData() {
      const filteredData = _.filter(
        this.$store.getters.getAllStudentsInfo,
        (user) =>
          _.includes(user.name.toUpperCase(), this.searchString.toUpperCase())
      )
      return filteredData
    },
    lessonData() {
      return this.$store.getters.getLessonData
    },
    isLoading() {
      return this.$store.getters.getStudentDataLoading
    },
  },
  methods: {
    routeToUserDetails(val) {
      this.$router.push({
        name: "userDetails",
        query: { userId: val.userId },
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
        name: "userDetails",
        query: { userId: "NEW" },
      })
    },
  },
  data() {
    return {
      searchString: "",
      selectedLessonId: "",
      datePickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [
          {
            text: "Today",
            onClick(picker) {
              picker.$emit("pick", new Date())
            },
          },
          {
            text: "Yesterday",
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24)
              picker.$emit("pick", date)
            },
          },
          {
            text: "A week ago",
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit("pick", date)
            },
          },
        ],
      },
      date: "",
    }
  },
}
</script>

<style scoped>
.lessonAndDate {
  display: flex;
  justify-content: space-around;
}

#searchBar {
  margin-top: 200px;
  margin-bottom: 200px;
}

#headerDiv {
  display: flex;
  justify-content: center;
}
</style>
