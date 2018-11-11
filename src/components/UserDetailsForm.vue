<template>
    <el-container>
        <el-main>
            <el-col class="userDetailsCol">
                <span id="detailsHeader">User Details</span>
                <el-form :model="userDetails" :disabled="disabled" label-width="100px" ref="form">
                    <el-form-item label="Name">
                        <el-input v-model="userDetails.name"></el-input>
                    </el-form-item>
                    <el-form-item label="Belt">
                        <el-input v-model="userDetails.belt"></el-input>
                    </el-form-item>
                    <el-form-item label="Class Type">
                        <el-input v-model="userDetails.classType"></el-input>
                    </el-form-item>
                    <el-form-item label="Date Enrolled">
                        <el-date-picker
                            v-model="userDetails.enrollmentDate"
                            type="date"
                            placeholder="Pick a day"
                            class="datePicker"
                            format="dd-MM-yyyy"
                        ></el-date-picker>
                    </el-form-item>
                    <el-form-item label="DOB">
                        <el-date-picker
                            v-model="userDetails.dob"
                            type="date"
                            placeholder="Pick a day"
                            class="datePicker"
                            format="dd-MM-yyyy"
                        ></el-date-picker>
                    </el-form-item>
                    <el-form-item label="NRIC">
                        <el-input v-model="userDetails.nric"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col class="contactDetailsCol">
                <span id="detailsHeader">Contact Details</span>
                <el-form
                    :model="contactDetails"
                    :disabled="disabled"
                    label-width="100px"
                    ref="form"
                >
                    <el-form-item label="Email">
                        <el-input v-model="contactDetails.email"></el-input>
                    </el-form-item>
                    <el-form-item label="Phone">
                        <el-input v-model="contactDetails.contact"></el-input>
                    </el-form-item>
                    <el-form-item label="Address">
                        <el-input type="textarea" v-model="contactDetails.address"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-main>
        <el-footer>
            <div class="comments">
                <span class="commentsHeader">Comments</span>
                <hr>
                <el-container>
                    <el-col>
                        <el-row id="commentsRow">
                            <a>List of Lessons</a>
                            <el-row>
                                <lesson-selector v-model="selectedLessonId"></lesson-selector>
                                <date-selector style="margin-left: 20px;" v-model="dateRange"></date-selector>
                            </el-row>
                            <el-table max-height="500" :data="attendanceData" style="width: 70%">
                                <el-table-column prop="lessonType" label="Lesson Type"></el-table-column>
                                <el-table-column prop="timestamp" label="Date of attendance taken"></el-table-column>
                                <el-table-column prop="presence" label="Presence"></el-table-column>
                            </el-table>
                        </el-row>
                        <el-row id="commentsRow">
                            <a>Payment History</a>
                        </el-row>
                    </el-col>
                    <el-col>
                        <el-row id="commentsRow">
                            <el-button>ADD PAYMENT</el-button>
                        </el-row>
                        <el-row id="commentsRow">
                            <el-button>MISCELLEANOUS PAYMENT</el-button>
                        </el-row>
                    </el-col>
                </el-container>
            </div>
        </el-footer>
    </el-container>
</template>

<script>
import _ from "lodash"
import moment from "moment"
import LessonSelector from "@/components/lessons/LessonSelector"
import DateSelector from "@/components/utils/DateSelector"

export default {
  components: {
    LessonSelector,
    DateSelector,
  },
  computed: {
    attendanceData() {
      const details = this.$store.getters.getStudentInfo(
        this.$route.query["userId"]
      )
      const filteredData = _.filter(details.attendance, (attendance) => {
        if (this.selectedLessonId) {
          return attendance.lessonId === this.selectedLessonId
        }
        return true
      })
      return _.map(filteredData, (attendanceData) => ({
        ...attendanceData,
        timestamp: moment(attendanceData.timestamp).format("DD-MM-YY"),
        lessonType: this.$store.getters.getLessonData(attendanceData.lessonId)
          .name,
      }))
    },
  },
  data() {
    const { selectedLessonId, dateRange } = this.$route.query["filters"]
    const details = this.$store.getters.getStudentInfo(
      this.$route.query["userId"]
    )
    const userDetails = _.pick(details, [
      "name",
      "belt",
      "classType",
      "dob",
      "nric",
      "enrollmentDate",
      "comments",
    ])

    const contactDetails = _.pick(details, ["email", "contact", "address"])
    return {
      userDetails,
      contactDetails,
      disabled: true,
      selectedLessonId,
      dateRange: dateRange.map((date) => moment(date)),
    }
  },
  methods: {
    addUser() {
      const payload = {
        ...this.userDetails,
        ...this.contactDetails,
      }
      this.$store.dispatch("addUser", payload)
      this.$router.push({
        name: "home",
      })
    },
  },
}
</script>

<style scoped>
.userDetailsCol {
  margin-left: 5%;
}
.contactDetailsCol {
  margin-right: 5%;
}
.datePicker {
  display: flex;
  align-self: flex-start;
}
.commentsHeader {
  display: inline-block;
  text-align: center;
}
.el-main {
  display: flex;
  flex-direction: row;
}
#detailsHeader {
  display: block;
  text-align: center;
  padding-bottom: 20px;
}

#commentsRow {
  margin-bottom: 20px;
  margin-top: 20px;
}
</style>
