<template>
  <el-container>
    <el-header>
      <el-button @click="routeToAttendancePage()" type="primary" round>Take attendance</el-button>
      <el-button type="primary" round>Add user</el-button>
      <el-button @click="routeToAddLesson()" type="primary" round>Add lesson</el-button>
    </el-header>
    <el-main>
      <div class="lessonAndDate">
        <el-dropdown trigger="click" placement="bottom">
          <el-button type="primary">
            Lesson type
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>Action 1</el-dropdown-item>
            <el-dropdown-item>Action 2</el-dropdown-item>
            <el-dropdown-item>Action 3</el-dropdown-item>
            <el-dropdown-item disabled>Action 4</el-dropdown-item>
            <el-dropdown-item divided>Action 5</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-date-picker
          v-model="date"
          type="date"
          placeholder="Pick a day"
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </div>
      <el-input id="searchBar" v-model="searchString" placeholder="Search by name"></el-input>
      <el-table stripe max-height="730" :data="tableData" style="width: 100%">
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
  created() {
    this.$store.dispatch("loadStudentsData")
  },
  computed: {
    tableData() {
      return _.filter(
        _.map(this.$store.state.students, (value, key) => {
          let userData = {
            ...value,
            userId: key,
          }
          if (!value.payments) {
            userData = {
              ...userData,
              lastPayment: "Have not made any payments",
            }
          }
          if (!value.attendance) {
            return {
              ...userData,
              attendance: 0,
            }
          }
          return userData
        }),
        (user) =>
          _.includes(user.name.toUpperCase(), this.searchString.toUpperCase())
      )
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
  },
  data() {
    return {
      searchString: "",
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
</style>
