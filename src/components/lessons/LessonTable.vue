<template>
  <div>
    <el-table :data="lessonData" style="width: 100%">
      <el-table-column prop="name" label="Lesson Name"></el-table-column>
      <el-table-column label="Operations" fixed="right">
        <template slot-scope="scope">
          <el-button @click="swap(scope.row)" type="text" size="small">Swap</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="Swap lesson" :visible.sync="swapDialogVisible">
      <span>Select which lesson to swap to from below</span>
      <br>
      <el-select v-model="lessonSwappingTo" style="margin-top: 20px">
        <el-option
          v-for="lesson in swapLessonData"
          :key="lesson.id"
          :value="lesson.id"
          :label="lesson.name"
        ></el-option>
      </el-select>
      <span slot="footer">
        <el-button type="primary" @click="conductSwap">Swap</el-button>
        <el-button @click="swapDialogVisible = false">Cancel</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash"
export default {
  props: {
    userId: {
      type: String,
      required: true,
    },
  },
  data() {
    const details = this.$store.getters.getStudentInfo(this.userId)
    const lessonIdUserIsIn = _.values(details.lessons)
    const allLessonData = this.$store.getters.getAllLessonData
    const filteredLessonData = _.filter(allLessonData, (lesson) =>
      _.includes(lessonIdUserIsIn, lesson.id)
    )
    const allLessonDataExceptUserIn = _.filter(
      allLessonData,
      (lesson) => !_.includes(lessonIdUserIsIn, lesson.id)
    )
    return {
      lessonData: filteredLessonData,
      swapLessonData: allLessonDataExceptUserIn,
      lessonIdToBeSwapped: "",
      lessonSwappingTo: "",
      swapDialogVisible: false,
    }
  },
  methods: {
    swap(lesson) {
      this.lessonIdToBeSwapped = lesson.id
      this.swapDialogVisible = true
    },
    conductSwap() {
      const details = this.$store.getters.getStudentInfo(this.userId)
      const userLessonIdToBeSwappedKey = _.findKey(
        details.lessons,
        (val) => val === this.lessonIdToBeSwapped
      )

      const allLessonData = this.$store.getters.getAllLessonData
      const lessonToBeSwapped = _.find(
        allLessonData,
        (lesson) => lesson.id === this.lessonIdToBeSwapped
      )
      const lessonUserIdKey = _.findKey(
        lessonToBeSwapped.users,
        (userId) => userId === this.userId
      )

      const swapLessonPayload = {
        userLessonIdToBeSwappedKey,
        oldlessonId: this.lessonIdToBeSwapped,
        newLessonId: this.lessonSwappingTo,
        userId: this.userId,
        lessonUserIdKey,
      }
      this.$store.dispatch("swapLessonForUser", swapLessonPayload)
      this.swapDialogVisible = false
    },
  },
}
</script>

<style>
</style>
