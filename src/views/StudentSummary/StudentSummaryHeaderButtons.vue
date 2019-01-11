<template>
  <div id="headerDiv">
    <el-button
      style="width: 200px"
      @click="routeToAttendancePage()"
      type="primary"
      round
    >Take Attendance</el-button>
    <el-button style="width: 200px" @click="routeToAddUser()" type="primary" round>Add Student</el-button>
    <el-button style="width: 200px" @click="routeToAddLesson()" type="primary" round>Add Lesson</el-button>
    <el-button
      style="width: 200px"
      @click="openSendMessageModal"
      type="primary"
      round
    >Send a Message</el-button>
    <el-button
      style="width: 200px"
      @click="routeToPriceList()"
      type="primary"
      round
    >View/Edit Price List</el-button>
    <el-button
      style="width: 200px"
      @click="() => paymentDueDialogVisible = true"
      type="primary"
      round
    >Payments</el-button>
    <el-popover
      style="margin-left: 10px"
      placement="bottom"
      title="Title"
      width="200"
      trigger="click"
    >
      <el-button style="width: 200px" type="primary" slot="reference" round>View/Edit Lessons</el-button>
      <el-select v-on:change="editSelectedLesson">
        <el-option
          v-for="lesson in lessonSelectData"
          :key="lesson.id"
          :label="lesson.name"
          :value="lesson.id"
        ></el-option>
      </el-select>
    </el-popover>

    <payment-due-dialog
      :paymentDialogVisible="paymentDueDialogVisible"
      @close="() => paymentDueDialogVisible = false"
    ></payment-due-dialog>
  </div>
</template>

<script>
import PaymentDueDialog from "@/components/studentDetails/PaymentDue"

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
  components: {
    PaymentDueDialog,
  },
  data() {
    return { paymentDueDialogVisible: false }
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
