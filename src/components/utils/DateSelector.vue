<template>
  <el-date-picker
    v-if="single"
    :value="value"
    @input="(event) => $emit('input', event)"
    type="date"
    placeholder="Pick a day"
    format="dd-MM-yyyy"
    clearable
  ></el-date-picker>
  <el-date-picker
    v-else
    :value="value"
    @input="(event) => $emit('input', event)"
    type="daterange"
    placeholder="Pick a day"
    range-separator="To"
    start-placeholder="Start Date"
    end-placeholder="End Date"
    :picker-options="datePickerOptions"
    format="dd-MM-yyyy"
    clearable
  ></el-date-picker>
</template>

<script>
import moment from "moment"
export default {
  props: {
    value: {
      required: true,
    },
    single: {
      type: Boolean,
    },
  },
  data() {
    return {
      datePickerOptions: {
        shortcuts: [
          {
            text: "Today",
            onClick(picker) {
              const start = moment()
              const end = moment()
              picker.$emit("pick", [start, end])
            },
          },
          {
            text: "This week",
            onClick(picker) {
              const start = moment().startOf("week")
              const end = moment()
              picker.$emit("pick", [start, end])
            },
          },
          {
            text: "This month",
            onClick(picker) {
              const start = moment().startOf("month")
              const end = moment()
              picker.$emit("pick", [start, end])
            },
          },
          {
            text: "All of time",
            onClick(picker) {
              const start = moment(0)
              const end = moment()
              picker.$emit("pick", [start, end])
            },
          },
        ],
      },
    }
  },
}
</script>

<style>
</style>
