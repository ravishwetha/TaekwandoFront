<template>
  <div>
    <div style="display: flex; justify-content: flex-end; padding-right: 3%">
      <el-button
        style="margin-left: 20px"
        :loading="signingUp"
        @click="signupDialogVisible = true"
        type="primary"
      >Sign up</el-button>
      <el-button v-if="loggedIn" @click="logout" type="danger">Log out</el-button>
    </div>
    <div id="nav">
      <router-link to="/">
        <img src="@/assets/tkdlogo.jpg" style="width: 250px; height: 150px;">
      </router-link>
      <div></div>
    </div>
    <el-dialog title="Sign Up New User" :visible.sync="signupDialogVisible">
      <el-form :model="loginDetails" :rules="rules" ref="loginDetails">
        <el-form-item label="Email Address" prop="username">
          <el-input v-model="loginDetails.username"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input type="password" v-model="loginDetails.password"></el-input>
          <el-button
            style="margin-top: 20px"
            :loading="signingUp"
            @click="submitForm('loginDetails')"
            type="primary"
          >Sign up</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    loggedIn: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      signupDialogVisible: false,
      loginDetails: {
        username: "",
        password: "",
      },
      signingUp: false,
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
    }
  },
  methods: {
    logout() {
      this.$store.dispatch("logout", this)
    },
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
          this.signingUp = true
          await this.$store.dispatch("login", {
            username: this.loginDetails.username,
            password: this.loginDetails.password,
            vm: this,
            signup: true,
          })
          this.signingUp = false
          this.signupDialogVisible = false
        }
      })
    },
  },
}
</script>

<style scoped>
#nav {
  display: flex;
  justify-content: center;
  padding-bottom: 20px;
}
</style>
