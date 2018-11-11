<template>
  <div id="app">
    <div>
      <div v-if="loggedIn" id="nav">
        <img src="@/assets/tkdlogo.jpg" style="width: 10%; height: 10%;">
        <div>
          <el-button @click="routeToHome">Home</el-button>
        </div>
        <el-select disabled>
          <el-option label="Haji Lane"></el-option>
        </el-select>
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
      return sessionStorage.getItem("token") !== null
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
</style>
