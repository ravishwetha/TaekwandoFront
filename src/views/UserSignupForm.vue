<template>
  <el-container>
    <el-main>
      <el-col class="userDetailsCol">
        <span class="detailsHeader">User Details</span>
        <el-form :model="formData" :rules="rules" label-width="120px" ref="userDetailsForm">
          <el-form-item label="Name" prop="name">
            <el-input v-model="formData.name"></el-input>
          </el-form-item>
          <el-form-item prop="belt" label="Belt">
            <el-input v-model="formData.belt"></el-input>
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
          <el-form-item v-if="!edit" prop="lessonId" label="Lesson">
            <lesson-selector v-model="formData.lessonId" :allLesson="false"></lesson-selector>
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
      belt: [
        {
          required: true,
          message: "Please input Belt name",
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
      dob: [
        {
          required: true,
          message: "Please input Date of Birth",
          trigger: "blur",
        },
      ],
      nric: [
        {
          required: true,
          message: "Please input NRIC",
          trigger: "blur",
        },
      ],
      email: [
        {
          required: true,
          message: "Please input email of student",
          trigger: "blur",
        },
        {
          type: "email",
          message: "Email format is wrong.",
          trigger: "blur",
        },
      ],
      contact: [
        {
          required: true,
          message: "Please input contact number of student",
          trigger: "blur",
        },
        {
          min: 8,
          max: 8,
          message: "Singapore phone numbers have only 8 digits.",
          trigger: "blur",
        },
      ],
      address: [
        {
          required: true,
          message: "Please input address of student",
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
        "belt",
        "classType",
        "dob",
        "nric",
        "enrollmentDate",
        "comments",
      ])
      const contactDetails = _.pick(details, ["email", "contact", "address"])
      return {
        formData: {
          ...userDetails,
          ...contactDetails,
        },
        rules,
        edit: true,
      }
    }
    return {
      formData: {
        name: "",
        belt: "",
        classType: "",
        dob: "",
        nric: "",
        enrollmentDate: "",
        comments: "",
        email: "",
        contact: "",
        address: "",
        lessonId: "",
      },
      rules,
      edit: false,
    }
  },
  methods: {
    async addUser(userForm, contactForm) {
      this.$refs[userForm].validate((userFormValid) => {
        this.$refs[contactForm].validate((contactFormValid) => {
          if (userFormValid && contactFormValid) {
            let payload = {
              ...this.formData,
              contact: "+65" + this.formData.contact,
            }
            this.$store.dispatch("addUser", payload)
            this.$router.push({
              name: "home",
            })
          }
        })
      })
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
