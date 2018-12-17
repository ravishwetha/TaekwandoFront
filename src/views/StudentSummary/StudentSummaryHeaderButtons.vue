<template>
  <div id="headerDiv">
    <el-button @click="routeToAttendancePage()" type="primary" round>Take attendance</el-button>
    <el-button @click="routeToAddUser()" type="primary" round>Add student</el-button>
    <el-button @click="routeToAddLesson()" type="primary" round>Add lesson</el-button>
    <el-button @click="openSendMessageModal" type="primary" round>Send a message</el-button>
    <el-button @click="routeToPriceList()" type="primary" round>View/Edit Price List</el-button>
    <el-popover
      style="margin-left: 10px"
      placement="bottom"
      title="Title"
      width="200"
      trigger="click"
    >
      <el-button type="primary" slot="reference" round>View/Edit Lessons</el-button>
      <el-select v-on:change="editSelectedLesson">
        <el-option
          v-for="lesson in lessonSelectData"
          :key="lesson.id"
          :label="lesson.name"
          :value="lesson.id"
        ></el-option>
      </el-select>
    </el-popover>
  </div>
</template>

<script>
export default {
  computed: {
    lessonSelectData() {
      const parsedData = _.map(
        this.$store.getters.getAllLessonData,
        (lesson, id) => ({ ...lesson, id })
      )
      return parsedData
    },
  },
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
    routeToPriceList() {
      this.$router.push({
        name: "priceList",
      })
    },
    editSelectedLesson(lessonId) {
      this.$router.push({
        name: "editLesson",
        query: {
          lessonId,
        },
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
