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
import { dayInDayTimeslotArray } from "@/common/findUtils"
export default {
  computed: {
    lessonData() {
      return _.map(this.$store.getters.getAllLessonData, (lessonData, id) => ({
        ...lessonData,
        id,
      }))
    },
    options() {
      const options = _.map(DAYS_ENGLISH, (day, dayKey) => {
        const filteredLessonData = _.filter(this.lessonData, (lesson) =>
          dayInDayTimeslotArray(_.get(lesson, "dayTimeslots", []), dayKey)
        )
        const children = _.map(filteredLessonData, (lesson) => ({
          value: lesson.id,
          label: lesson.name,
        }))
        return {
          value: dayKey,
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
