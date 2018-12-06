<template>
  <div id="app">
    <header-t-k-d :loggedIn="loggedIn"></header-t-k-d>
    <router-view/>
  </div>
</template>

<script>
import HeaderTKD from "@/components/common/Header.vue"
export default {
  components: {
    HeaderTKD,
  },
  methods: {},
  computed: {
    loggedIn() {
      return this.$store.getters.getLoggedInStatus
    },
  },
  data() {
    return {
      activeTab: "current",
    }
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
</style>
