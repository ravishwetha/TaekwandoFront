<template>
  <el-main>
    <el-col class="userDetailsCol">
      <span id="detailsHeader">Student Details</span>
      <el-form style="paddingRight: 10px;" :model="userDetails" label-width="105px" ref="form">
        <el-form-item id="detailsText" label="Name:">
          <span>{{userDetails.name}}</span>
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
      <div style="margin-left: 200px; margin-bottom: 50px">
        <el-button @click="editUser()" style="width: 80%" type="success">Edit User</el-button>
      </div>
      <div style="margin-left: 200px;">
        <el-button @click="deleteUser()" style="width: 80%" type="danger">Terminate User</el-button>
      </div>
    </el-col>
  </el-main>
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

<style>
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
  display: block;
  text-align: center;
  padding-bottom: 20px;
  font-size: 40px;
}

#detailsText {
  border: 1px solid black;
}
</style>
