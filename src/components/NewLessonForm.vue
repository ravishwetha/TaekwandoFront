<template>
  <div class="formDiv">
    <el-form
      :model="form"
      :rules="rules"
      class="form"
      label-position="top"
      size="medium"
      ref="form"
    >
      <el-form-item label="Lesson Name" class="formItem" prop="name">
        <el-input placeholder="Please input lesson name" v-model="form.name" class="formInput"></el-input>
      </el-form-item>
      <el-form-item label="Days:" class="formItem" prop="days">
        <el-checkbox-group v-model="form.days" class="formInput">
          <el-checkbox label="MON" name="type"></el-checkbox>
          <el-checkbox label="TUE" name="type"></el-checkbox>
          <el-checkbox label="WED" name="type"></el-checkbox>
          <el-checkbox label="THU" name="type"></el-checkbox>
          <el-checkbox label="FRI" name="type"></el-checkbox>
          <el-checkbox label="SAT" name="type"></el-checkbox>
          <el-checkbox label="SUN" name="type"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item
        v-for="(timeslot) in form.timeslots"
        label="Select timeslot"
        :key="timeslot.key"
      >
        <el-time-select
          class="formInput"
          v-model="timeslot.from"
          placeholder="Select start time"
          :picker-options="startTimePickerOptions"
        ></el-time-select>
        <el-time-select
          class="formInput"
          v-model="timeslot.to"
          placeholder="Select end time"
          :picker-options="endTimePickerOptions"
        ></el-time-select>
        <el-button @click.prevent="removeTimeslot(timeslot)">Delete</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="createNewLesson('form')">Submit</el-button>
        <el-button @click="addTimeslot">New Timeslot</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import _ from "lodash"
import moment from "moment"
export default {
  data() {
    return {
      form: {
        name: "",
        days: [],
        timeslots: [
          {
            from: "",
            to: "",
            key: 1,
          },
        ],
      },
      startTimePickerOptions: {
        start: "09:00",
        end: "20:00",
        step: "00:30",
      },
      endTimePickerOptions: {
        start: "09:00",
        end: "20:00",
        step: "00:30",
      },
      rules: {
        name: [
          {
            required: true,
            message: "Please input class name",
            trigger: "blur",
          },
          {
            min: 3,
            message: "Length should be at least 3 characters long",
            trigger: "blur",
          },
        ],
        days: [
          {
            required: true,
            type: "array",
            message: "Please select the days for this class",
            trigger: "change",
          },
        ],
      },
    }
  },
  methods: {
    createNewLesson(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let formData = _.pick(this.form, ["name", "days", "timeslots"])
          formData = {
            ...formData,
            timeslots: _.map(formData.timeslots, (timeslot) => {
              const parsedFrom = moment(timeslot.from, "HH:mm").toISOString()
              const parsedTo = moment(timeslot.to, "HH:mm").toISOString()
              return parsedFrom + "/" + parsedTo
            }),
          }
          this.$store.dispatch("createNewLesson", formData)
          this.$router.push({
            name: "home",
          })
        }
      })
    },
    removeTimeslot(item) {
      var index = this.form.timeslots.indexOf(item)
      if (index !== -1) {
        this.form.timeslots.splice(index, 1)
      }
    },
    addTimeslot() {
      this.form.timeslots.push({
        key: Date.now(),
        value: "",
      })
    },
  },
}
</script>
