<template>
  <el-select :value="value" @input="(event) => $emit('input', event)">
    <el-option v-for="item in lessonData" :key="item.id" :value="item.id" :label="item.name"></el-option>
  </el-select>
</template>

<script>
export default {
  computed: {
    lessonData() {
      if (this.$props.allLesson === false) {
        return [...this.$store.getters.getAllLessonData]
      }
      return [
        { name: "All lessons", id: "" },
        ...this.$store.getters.getAllLessonData,
      ]
    },
  },
  props: ["value", "allLesson"],
}
</script>

<style>
</style>
