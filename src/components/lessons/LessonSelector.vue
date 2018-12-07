<template>
  <el-cascader
    :clearable="true"
    expand-trigger="hover"
    :options="options"
    :value="value"
    @input="(event) => $emit('input', event)"
  ></el-cascader>
</template>

<script>
import _ from "lodash"
import { DAYS_ENGLISH } from "@/common/data"
export default {
  computed: {
    lessonData() {
      if (this.allLesson === false) {
        return [...this.$store.getters.getAllLessonData]
      }
      return [
        { name: "All lessons", id: "" },
        ...this.$store.getters.getAllLessonData,
      ]
    },
    options() {
      const options = _.map(DAYS_ENGLISH, (day) => {
        const filteredLessonData = _.filter(this.lessonData, (lesson) =>
          _.includes(lesson.days, day)
        )
        const children = _.map(filteredLessonData, (lesson) => ({
          value: lesson.id,
          label: lesson.name,
        }))
        return {
          value: day,
          label: day,
          children,
        }
      })
      return options
    },
  },
  props: ["value", "allLesson"],
}
</script>

<style>
</style>
