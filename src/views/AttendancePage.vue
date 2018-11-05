<template>
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
                        <el-button id="newStudentDiv" type="primary">Add a new student to class</el-button>
                    </el-col>
                    <el-col id="presentAbsent" span="6">
                        <span>Present count : {{present}} / {{total}}</span>
                    </el-col>
                    <el-col id="presentAbsent" span="6">
                        <span>Absent count : {{absent}} / {{total}}</span>
                    </el-col>
                </el-row>
            </el-col>
            <hr>
            <el-table :data="tableData" style="width: 100%">
                <el-table-column label="Name">
                    <template slot-scope="scope">
                        <a href="">{{scope.row.name}}</a>
                    </template>
                </el-table-column>
                <el-table-column label="Present">
                    <template slot-scope="scope">
                        <el-checkbox label="Present"></el-checkbox>
                    </template>
                </el-table-column>
                <el-table-column label="Absent">
                    <template slot-scope="scope">
                        <el-checkbox label="Present"></el-checkbox>
                    </template>
                </el-table-column>
            </el-table>
        </el-main>
    </el-container>
</template>

<script>
import moment from "moment"
import _ from "lodash"
import { DAYS } from "@/common/data"
export default {
  computed: {
    lessonData() {
      console.log(this.$store.getters.getLessonData)
      const lol = _.filter(this.$store.getters.getLessonData, (lesson) => {
        for (const day of lesson.days) {
          console.log(moment().day() === DAYS[day])
          if (moment().day() === DAYS[day]) {
            return true
          }
        }
      })
      return lol
    },
    tableData() {
      return [{ name: "Dummy" }]
    },
  },
  data() {
    return {
      selectedDate: moment().format("DD MMM YYYY"),
      lessonValue: "",
      present: 0,
      absent: 0,
      total: 0,
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
</style>
