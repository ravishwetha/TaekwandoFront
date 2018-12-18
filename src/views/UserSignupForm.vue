<template>
  <el-container>
    <el-main>
      <el-col class="userDetailsCol">
        <span class="detailsHeader">User Details</span>
        <el-form :model="formData" :rules="rules" label-width="120px" ref="userDetailsForm">
          <el-form-item label="Name" prop="name">
            <el-input v-model="formData.name"></el-input>
          </el-form-item>
          <el-form-item prop="enrollmentDate" label="Date Enrolled">
            <el-date-picker
              v-model="formData.enrollmentDate"
              type="date"
              placeholder="Pick a day"
              class="datePicker"
              format="dd-MM-yyyy"
            ></el-date-picker>
          </el-form-item>
          <el-form-item prop="dob" label="DOB">
            <el-date-picker
              v-model="formData.dob"
              type="date"
              placeholder="Pick a day"
              class="datePicker"
              format="dd-MM-yyyy"
            ></el-date-picker>
          </el-form-item>
          <el-form-item prop="nric" label="NRIC">
            <el-input v-model="formData.nric"></el-input>
          </el-form-item>
          <el-form-item prop="status" label="User Type">
            <el-switch
              v-model="formData.status"
              inactive-text="Active"
              active-text="Trial"
              :inactive-value="ACTIVE"
              :active-value="TRIAL"
              inactive-color="#13ce66"
            ></el-switch>
          </el-form-item>
          <el-form-item label="Comments">
            <el-input type="textarea" v-model="formData.comments"></el-input>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col class="contactDetailsCol">
        <span class="detailsHeader">Contact Details</span>
        <el-form :model="this.formData" :rules="rules" label-width="120px" ref="contactDetailsForm">
          <el-form-item prop="email" label="Email">
            <el-input v-model="formData.email"></el-input>
          </el-form-item>
          <el-form-item label="Phone" prop="contact">
            <el-input v-model="formData.contact">
              <template slot="prepend">+65</template>
            </el-input>
          </el-form-item>
          <el-form-item prop="address" label="Address">
            <el-input type="textarea" v-model="formData.address"></el-input>
          </el-form-item>
        </el-form>
        <div id="submitButtonDiv">
          <el-button
            v-if="edit"
            @click="editUser('userDetailsForm', 'contactDetailsForm')"
            type="primary"
          >Edit Student</el-button>
          <el-button
            v-else
            @click="addUser('userDetailsForm', 'contactDetailsForm')"
            type="primary"
          >Add Student</el-button>
        </div>
      </el-col>
    </el-main>
  </el-container>
</template>

<script>
import LessonSelector from "@/components/lessons/LessonSelector"
import _ from "lodash"
import { ACTIVE, TRIAL } from "@/common/data"

export default {
  components: {
    LessonSelector,
  },
  data() {
    const rules = {
      name: [
        {
          required: true,
          message: "Please input Student name",
          trigger: "blur",
        },
      ],
      enrollmentDate: [
        {
          required: true,
          message: "Please input date of enrollment",
          trigger: "blur",
        },
      ],
      email: [
        {
          type: "email",
          message: "Email format is wrong.",
          trigger: "blur",
        },
      ],
      contact: [
        {
          min: 0,
          max: 8,
          message: "Singapore phone numbers have only 8 digits.",
          trigger: "blur",
        },
      ],
    }

    if (this.$route.query["userId"]) {
      const details = this.$store.getters.getStudentInfo(
        this.$route.query["userId"]
      )
      let userDetails = _.pick(details, [
        "name",
        "dob",
        "nric",
        "enrollmentDate",
        "comments",
        "status",
      ])
      const contactDetails = _.pick(details, ["email", "contact", "address"])
      return {
        formData: {
          ...userDetails,
          ...contactDetails,
        },
        rules,
        edit: true,
        ACTIVE,
        TRIAL,
      }
    }
    return {
      formData: {
        name: "",
        dob: "",
        nric: "",
        enrollmentDate: "",
        comments: "",
        email: "",
        contact: "",
        address: "",
        status: ACTIVE,
      },
      addDialogVisible: false,
      rules,
      edit: false,
      ACTIVE,
      TRIAL,
    }
  },
  methods: {
    async addUser(userForm, contactForm) {
      this.$refs[userForm].validate((userFormValid) => {
        this.$refs[contactForm].validate((contactFormValid) => {
          if (userFormValid && contactFormValid) {
            let payload = {
              ...this.formData,
            }
            this.$store.dispatch("addUser", payload)
            this.$router.push({
              name: "home",
            })
          }
        })
      })
    },
    closeAddDialog() {
      this.addDialogVisible = false
    },
    async editUser(userForm, contactForm) {
      this.$refs[userForm].validate((userFormValid) => {
        this.$refs[contactForm].validate((contactFormValid) => {
          if (userFormValid && contactFormValid) {
            const payload = {
              userData: {
                ...this.formData,
              },
              userId: this.$route.query["userId"],
            }
            this.$store.dispatch("updateUser", payload)
            this.$router.back()
          }
        })
      })
    },
  },
}
</script>

<style>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}
</style>
