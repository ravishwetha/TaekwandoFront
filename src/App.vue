<template>
  <div id="app">
    <div id="nav">
      <el-row style="width: 98%;">
        <el-col :span="8" style="padding-top: 7%;">
          <span v-if="loggedIn" id="header">
            <el-select disabled>
              <el-option label="Haig Branch"></el-option>
            </el-select>
          </span>
        </el-col>
        <el-col :offset="1" :span="8">
          <router-link to="/">
            <img src="@/assets/tkdlogo.jpg" style="width: 50%; height: 50%;">
          </router-link>
        </el-col>
        <el-col :span="8"></el-col>
      </el-row>
    </div>
    <router-view/>
  </div>
</template>

<script>
export default {
  methods: {
    routeToHome() {
      this.$router.push("/")
    },
  },
  computed: {
    loggedIn() {
      return this.$store.getters.getLoggedInStatus
    },
  },
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}

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
