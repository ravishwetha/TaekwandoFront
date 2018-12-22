<template>
  <div>
    <el-table v-loading="isLoading" stripe max-height="730" :data="value" style="width: 100%">
      <el-table-column prop="name" label="Name"></el-table-column>
      <el-table-column prop="presentCount" label="Total Present Count"></el-table-column>
      <el-table-column prop="lastPayment" label="Last Payment"></el-table-column>
      <el-table-column label="Operations" fixed="right">
        <template slot-scope="scope">
          <el-button @click="routeToUserDetails(scope.row)" type="text" size="small">Details</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="branch" label="Branch"></el-table-column>
    </el-table>
  </div>
</template>

<script>
import _ from "lodash"
import Moment from "moment"
import { extendMoment } from "moment-range"
const moment = extendMoment(Moment)

export default {
  computed: {
    isLoading() {
      return this.$store.getters.getStudentDataLoading
    },
  },

  methods: {
    routeToUserDetails(val) {
      const dateRange = this.dateRange !== null ? this.dateRange : []
      this.$router.push({
        name: "userDetails",
        query: {
          userId: val.userId,
          dateRange: dateRange.map((date) => moment(date).toISOString()),
          selectedLessonId: this.selectedLessonId,
        },
      })
    },
  },
  props: {
    dateRange: {
      type: Array,
      required: true,
    },
    value: {
      type: Array,
      required: true,
    },
    selectedLessonId: {
      type: Array,
      required: true,
    },
  },
}
</script>

<style>
</style>
