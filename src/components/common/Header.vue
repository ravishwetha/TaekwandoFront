<template>
  <div id="nav">
    <el-row style="width: 97%;">
      <el-col :span="8" style="padding-top: 7%;"></el-col>
      <el-col :offset="2" :span="8">
        <router-link to="/">
          <img src="@/assets/tkdlogo.jpg" style="width: 50%; height: 50%;">
        </router-link>
      </el-col>
      <el-col :span="8"></el-col>
    </el-row>
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
}
</script>

<style scoped>
#nav {
  display: flex;
  justify-content: space-around;
  padding-bottom: 20px;
}
#header {
  display: flex;
  justify-content: left;
}
</style>
