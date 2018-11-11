<template>
  <el-form :model="loginDetails" :rules="rules" ref="loginDetails">
    <el-form-item label="Username" prop="username">
      <el-input v-model="loginDetails.username"></el-input>
    </el-form-item>
    <el-form-item label="Password" prop="password">
      <el-input v-model="loginDetails.password"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm('loginDetails')">Login</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { loginAPI } from "@/common/api"
export default {
  name: "login",
  data() {
    return {
      loginDetails: {
        username: "",
        password: "",
      },
      rules: {
        username: [
          {
            required: true,
            message: "Please input Activity name",
            trigger: "blur",
          },
        ],
        password: [
          {
            required: true,
            message: "Please input password",
            trigger: "blur",
          },
        ],
      },
    }
  },
  methods: {
    async submitForm(loginDetails) {
      this.$refs[loginDetails].validate((valid) => {
        if (!valid) {
          alert("Please enter your username or password")
        }
      })
      if (
        this.loginDetails.username != "" &&
        this.loginDetails.password != ""
      ) {
        try {
          const token = await loginAPI({
            username: this.loginDetails.username,
            password: this.loginDetails.password,
          })
          sessionStorage.setItem("token", token)
          this.$store.dispatch("login")
          this.$router.push({
            name: "home",
          })
        } catch (e) {
          this.$notify({
            title: "Login failed",
            message: "Username does not match password",
            duration: 0,
          })
        }
      }
    },
  },
}
</script>
