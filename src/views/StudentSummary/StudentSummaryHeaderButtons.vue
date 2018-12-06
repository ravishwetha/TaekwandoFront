<template>
  <div id="headerDiv">
    <el-button @click="routeToAttendancePage()" type="primary" round>Take attendance</el-button>
    <el-button @click="routeToAddUser()" type="primary" round>Add student</el-button>
    <el-button @click="routeToAddLesson()" type="primary" round>Add lesson</el-button>
    <el-button @click="openSendMessageModal" type="primary" round>Send a message</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    routeToAttendancePage() {
      this.$router.push({
        name: "attendance",
      })
    },
    routeToAddLesson() {
      this.$router.push("newLesson")
    },
    routeToAddUser() {
      this.$router.push({
        name: "signup",
      })
    },
  },
  props: {
    openSendMessageModal: {
      type: Function,
      required: true,
    },
  },
}
</script>

<style scoped>
#headerDiv {
  display: flex;
  justify-content: center;
}
</style>
