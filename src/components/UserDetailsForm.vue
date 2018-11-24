<template>
  <el-container>
    <el-main>
      <el-col class="userDetailsCol">
        <span id="detailsHeader">User Details</span>
        <el-form
          style="paddingRight: 10px;"
          :model="userDetails"
          :disabled="disabled"
          label-width="105px"
          ref="form"
        >
          <el-form-item id="detailsText" label="Name:">
            <span>{{userDetails.name}}</span>
          </el-form-item>
          <el-form-item id="detailsText" label="Belt:">
            <span>{{userDetails.belt}}</span>
          </el-form-item>
          <el-form-item id="detailsText" label="Class Type:">
            <span>{{userDetails.classType}}</span>
          </el-form-item>
          <el-form-item id="detailsText" label="Date Enrolled:">
            <span>{{userDetails.enrollmentDate}}</span>
          </el-form-item>
          <el-form-item id="detailsText" label="DOB:">
            <span>{{userDetails.dob}}</span>
          </el-form-item>
          <el-form-item id="detailsText" label="NRIC:">
            <span>{{userDetails.nric}}</span>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col class="contactDetailsCol">
        <span id="detailsHeader">Contact Details</span>
        <el-form :model="contactDetails" :disabled="disabled" label-width="100px" ref="form">
          <el-form-item id="detailsText" label="Email:">
            <span>{{contactDetails.email}}</span>
          </el-form-item>
          <el-form-item id="detailsText" label="Phone:">
            <span>{{contactDetails.contact}}</span>
          </el-form-item>
          <el-form-item id="detailsText" label="Address:">
            <span>{{contactDetails.address}}</span>
          </el-form-item>
        </el-form>
        <div style="margin-left: 200px; margin-bottom: 50px">
          <el-button @click="editUser()" style="width: 80%" type="success">Edit User</el-button>
        </div>
        <div style="margin-left: 200px;">
          <el-button @click="deleteUser()" style="width: 80%" type="danger">Delete User</el-button>
        </div>
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
  mounted() {
    const { selectedLessonId, dateRange } = this.$route.query
    const details = this.$store.getters.getStudentInfo(
      this.$route.query["userId"]
    )
    let userDetails = _.pick(details, [
      "name",
      "belt",
      "classType",
      "dob",
      "nric",
      "enrollmentDate",
      "comments",
    ])

    userDetails = {
      ...userDetails,
      enrollmentDate: moment(userDetails.enrollmentDate).format("DD-MM-YYYY"),
      dob: moment(userDetails.dob).format("DD-MM-YYYY"),
    }
    this.userDetails = userDetails

    const contactDetails = _.pick(details, ["email", "contact", "address"])
    this.contactDetails = contactDetails
    this.selectedLessonId = selectedLessonId
    this.dateRange = dateRange.map((date) => moment(date))
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
    return {
      userDetails: {
        name: "",
        belt: "",
        classType: "",
        dob: "",
        nric: "",
        enrollmentDate: "",
        comments: "",
      },
      contactDetails: {
        email: "",
        contact: "",
        address: "",
      },
      selectedLessonId: "",
      dateRange: "",
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
    deleteUser() {
      this.$store.dispatch("deleteUser", {
        userId: this.$route.query["userId"],
      })
      this.$notify({
        title: "User deleted",
        message: "User has been deleted.",
        duration: 0,
      })
      this.$router.push({
        name: "home",
      })
    },
    editUser() {
      this.$router.push({
        name: "edit",
        query: {
          userId: this.$route.query["userId"],
        },
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

#detailsText {
  border: 1px solid black;
}
</style>
