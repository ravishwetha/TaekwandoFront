<template>
  <div>
    <span id="detailsHeader">{{userDetails.name}}</span>
    <hr>
    <el-main>
      <el-col class="userDetailsCol">
        <el-form style="paddingRight: 10px;" :model="userDetails" label-width="105px" ref="form">
          <el-form-item id="detailsText" label="Enrolled:">
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
        <el-form :model="contactDetails" label-width="100px" ref="form">
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
      </el-col>
    </el-main>
    <el-form label-width="100px">
      <el-form-item style="width: 88%; margin-left: 6%;" id="detailsText" label="Comments:">
        <span>{{userDetails.comments}}</span>
      </el-form-item>
    </el-form>
    <div
      style="display: flex; flex-direction: row; padding-bottom: 2%; justify-content: space-around;"
    >
      <el-button @click="editUser()" style="width: 44%; margin-left: 4%;" type="success">Edit User</el-button>
      <el-button
        @click="deleteUser()"
        style="width: 44%; margin-right: 4%;"
        type="danger"
      >Terminate User</el-button>
    </div>
  </div>
</template>

<script>
import moment from "moment"
export default {
  mounted() {
    const details = this.$store.getters.getStudentInfo(this.userId)
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
  },
  methods: {
    deleteUser() {
      this.$store.dispatch("deleteUser", {
        userId: this.userId,
      })
      this.$notify({
        title: "Student Terminated",
        message: "Student has been terminated.",
      })
      this.$router.push({
        name: "home",
      })
    },
    editUser() {
      this.$router.push({
        name: "edit",
        query: {
          userId: this.userId,
        },
      })
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
        entitlement: "",
      },
      contactDetails: {
        email: "",
        contact: "",
        address: "",
      },
    }
  },
  props: {
    userId: {
      type: String,
      required: true,
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

.commentsHeader {
  display: inline-block;
  text-align: center;
  padding-bottom: 10px;
}
.el-main {
  display: flex;
  flex-direction: row;
}
#detailsHeader {
  font-size: 25px;
  padding-bottom: 10px;
  margin-left: 1%;
}

#detailsText {
  border: 1px solid black;
}
</style>
