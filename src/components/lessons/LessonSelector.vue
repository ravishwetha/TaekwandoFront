<template>
    <el-select :value="value" @input="(event) => $emit('input', event)">
        <el-option v-for="item in lessonData" :key="item.id" :value="item.id" :label="item.name"></el-option>
    </el-select>
</template>

<script>
export default {
  computed: {
    lessonData() {
      return [
        { name: "All lessons", id: "" },
        ...this.$store.getters.getAllLessonData,
      ]
    },
  },
  props: ["value"],
}
</script>

<style>
</style>
