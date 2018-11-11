<template>
  <el-date-picker
    :value="value"
    @input="(event) => $emit('input', event)"
    type="daterange"
    placeholder="Pick a day"
    range-separator="To"
    start-placeholder="Start Date"
    end-placeholder="End Date"
    :picker-options="datePickerOptions"
    format="dd-MM-yyyy"
  ></el-date-picker>
</template>

<script>
import moment from "moment"
export default {
  props: ["value"],
  data() {
    return {
      datePickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
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
