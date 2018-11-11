<template>
  <div id="app">
    <div>
      <div v-if="loggedIn" id="nav">
        <span id="header">
          <el-button type="primary" @click="routeToHome">Home</el-button>
        </span>
        <img src="@/assets/tkdlogo.jpg" style="width: 20%; height: 20%;">
        <span id="header">
          <el-select disabled>
            <el-option label="Haig Branch"></el-option>
          </el-select>
        </span>
      </div>
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
  padding-top: 7%;
}
</style>
