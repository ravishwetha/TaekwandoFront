<template>
    <el-form :model="loginDetails" :rules="rules" ref="loginDetails">
        <el-form-item label="Username" prop="username">
            <el-input v-model="loginDetails.username"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password">
            <el-input v-model="loginDetails.password"></el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submitForm('loginDetails')">Create</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
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
    submitForm(loginDetails) {
      console.log(
        this.$refs[loginDetails].validate((valid) => {
          if (valid) {
            alert("valid")
          }
          alert("invaid")
        })
      )
    },
  },
}
</script>

<style>
</style>
