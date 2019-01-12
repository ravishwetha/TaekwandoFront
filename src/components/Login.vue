<template>
  <el-form :model="loginDetails" :rules="rules" ref="loginDetails">
    <el-form-item label="Email Address" prop="username">
      <el-input v-model="loginDetails.username"></el-input>
    </el-form-item>
    <el-form-item label="Password" prop="password">
      <el-input type="password" v-model="loginDetails.password"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button :loading="loggingIn" type="primary" @click="submitForm('loginDetails')">Login</el-button>
      <el-popover style="margin-left: 20px;" placement="top-start" width="400" trigger="click">
        <el-button type="warning" slot="reference">Change/Forgot Password</el-button>
        <el-form :model="passwordResetUsername" :rules="rules" ref="reset">
          <el-form-item prop="username" label="Email Address">
            <el-input v-model="passwordResetUsername.username"></el-input>
          </el-form-item>
          <el-button @click="resetPassword('reset')" type="warning">Reset password</el-button>
        </el-form>
      </el-popover>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      passwordResetUsername: {
        username: "",
      },
      loginDetails: {
        username: "",
        password: "",
      },
      rules: {
        username: [
          {
            required: true,
            type: "email",
            message: "Please input a valid email address",
            trigger: "blur",
          },
        ],
        password: [
          {
            required: true,
            message: "Please input Password",
            trigger: "blur",
          },
        ],
      },
      loggingIn: false,
    }
  },
  methods: {
    async submitForm(loginDetails) {
      this.$refs[loginDetails].validate(async (valid) => {
        if (!valid) {
          alert("Please enter a valid username and password")
          return
        }
        if (
          this.loginDetails.username != "" &&
          this.loginDetails.password != ""
        ) {
          this.loggingIn = true
          await this.$store.dispatch("login", {
            username: this.loginDetails.username,
            password: this.loginDetails.password,
            vm: this,
            signup: false,
          })
        }
      })
    },

    resetPassword(reset) {
      this.$refs[reset].validate(async (valid) => {
        if (valid) {
          this.$store.dispatch("resetPassword", {
            email: this.passwordResetUsername.username,
            vm: this,
          })
        }
      })
    },
  },
}
</script>
