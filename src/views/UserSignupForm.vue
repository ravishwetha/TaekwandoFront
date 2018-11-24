<template>
    <el-container>
        <el-main>
            <el-col class="userDetailsCol">
                <span class="detailsHeader">User Details</span>
                <el-form :model="userDetails" label-width="100px" ref="userForm">
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
                    <el-form-item label="Comments">
                        <el-input type="textarea" v-model="userDetails.comments"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col class="contactDetailsCol">
                <span class="detailsHeader">Contact Details</span>
                <el-form :model="contactDetails" label-width="100px" ref="contactForm">
                    <el-form-item label="Email">
                        <el-input v-model="contactDetails.email"></el-input>
                    </el-form-item>
                    <el-form-item label="Phone" prop="contactDetails.contact">
                        <el-input v-model="contactDetails.contact">
                            <template slot="prepend">+65</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Address">
                        <el-input type="textarea" v-model="contactDetails.address"></el-input>
                    </el-form-item>
                </el-form>
                <div id="submitButtonDiv">
                    <el-button v-if="edit" @click="editUser" type="primary">Edit User</el-button>
                    <el-button v-else @click="addUser" type="primary">Add User</el-button>
                </div>
            </el-col>
        </el-main>
    </el-container>
</template>

<script>
export default {
  data() {
    if (this.$route.query["userId"]) {
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
      const contactDetails = _.pick(details, ["email", "contact", "address"])
      return {
        userDetails,
        contactDetails,
        edit: true,
      }
    }
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
    }
  },
  methods: {
    addUser() {
      const payload = {
        ...this.userDetails,
        ...this.contactDetails,
        contact: "+65" + this.contactDetails.contact,
      }
      this.$store.dispatch("addUser", payload)
      this.$router.push({
        name: "home",
      })
    },
    async editUser() {
      const payload = {
        userData: {
          ...this.userDetails,
          ...this.contactDetails,
        },
        userId: this.$route.query["userId"],
      }
      await this.$store.dispatch("updateUser", payload)
      this.$router.back()
    },
  },
}
</script>

<style>
</style>
