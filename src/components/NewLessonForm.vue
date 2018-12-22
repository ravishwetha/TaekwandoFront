<template>
  <div class="formDiv">
    <el-row :gutter="2">
      <el-col :span="12">
        <el-form
          :model="form"
          :rules="rules"
          class="form"
          label-position="top"
          size="medium"
          ref="form"
        >
          <el-form-item label="Lesson Name" class="formItem" prop="name">
            <el-input
              style="width: 70%"
              placeholder="Please input lesson name"
              v-model="form.name"
              class="formInput"
            ></el-input>
          </el-form-item>
          <el-form-item label="Select ALL days that this lesson has:" class="formItem" prop="days">
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
            label="Select ALL timeslots this lesson has for ANY day:"
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
            <el-button v-if="edit" @click="deleteLesson()" type="primary">Delete lesson</el-button>
            <el-button v-if="edit" @click="createNewLesson('form', edit)" type="primary">Edit lesson</el-button>
            <el-button v-else type="primary" @click="createNewLesson('form')">Submit</el-button>
            <el-button @click="addTimeslot">New Timeslot</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col v-if="edit" :span="12">
        <el-table :data="studentInLessonTableData" style="width: 100%">
          <el-table-column prop="name" label="Name"></el-table-column>
          <el-table-column prop="day" label="Day"></el-table-column>
          <el-table-column prop="timeslot" label="Timeslot"></el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import _ from "lodash"
import moment from "moment"
import { readableTimeslotParser } from "../common/dateUtils"
export default {
  beforeMount() {
    const lessonId = this.$route.query["lessonId"]
    if (lessonId) {
      this.edit = true
      const { name, days, timeslots } = this.$store.getters.getLessonData(
        lessonId
      )
      this.form.name = name
      this.form.days = days
      const parsedTimeSlots = _.map(timeslots, (timeslot) => {
        const [from, to] = timeslot.split("/")
        return {
          from: moment(from).format("HH:mm"),
          to: moment(to).format("HH:mm"),
          key: Math.random(),
        }
      })
      this.form.timeslots = parsedTimeSlots
    }
  },
  computed: {
    studentInLessonTableData() {
      const lessonId = this.$route.query["lessonId"]
      const lessonData = this.$store.getters.getLessonData(lessonId)
      const studentIdsInLesson = _.values(lessonData.Users)
      const studentsInLesson = _.map(studentIdsInLesson, (studentId) => {
        const studentInfo = this.$store.getters.getStudentInfo(studentId)
        let studentCol = {
          name: studentInfo.name,
        }
        const { day, timeslot } = studentInfo.lessons[lessonId]
        studentCol = {
          ...studentCol,
          day,
          timeslot: readableTimeslotParser(timeslot),
        }
        return studentCol
      })
      return studentsInLesson
    },
  },
  data() {
    return {
      edit: false,
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
    deleteLesson() {
      this.$store.dispatch("deleteLesson", {
        lessonId: this.$route.query["lessonId"],
      })
      this.$router.push({
        name: "home",
      })
    },
    createNewLesson(formName, edit) {
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
          if (edit) {
            this.$store.dispatch("editLesson", {
              formData,
              lessonId: this.$route.query["lessonId"],
            })
          } else {
            this.$store.dispatch("createNewLesson", formData)
          }
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
