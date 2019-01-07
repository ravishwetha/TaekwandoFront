<template>
  <div>
    <div style="display: flex; justify-content: flex-end; padding-right: 3%">
      <el-button v-if="loggedIn" @click="logout" type="danger">Log out</el-button>
    </div>
    <div id="nav">
      <router-link to="/">
        <img src="@/assets/tkdlogo.jpg" style="width: 250px; height: 150px;">
      </router-link>
      <div></div>
    </div>
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
  methods: {
    logout() {
      this.$store.dispatch("logout", this)
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
