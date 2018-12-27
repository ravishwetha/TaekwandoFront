<template>
  <el-select @input="(event) => $emit('input', event)" :value="value" placeholder="Select day">
    <el-option v-for="item in DAYS" :key="item" :label="item" :value="item"></el-option>
  </el-select>
</template>

<script>
import _ from "lodash"
import { DAYS } from "@/common/data"

export default {
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  data() {
    return { DAYS: _.keys(DAYS) }
  },
}
</script>

<style>
</style>
