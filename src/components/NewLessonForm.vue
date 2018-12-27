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
          <el-form-item
            v-for="(dayTimeslot) in form.dayTimeslots"
            label="Select day and timeslot"
            :key="dayTimeslot.key"
          >
            <day-selector v-model="dayTimeslot.day"></day-selector>
            <el-time-select
              class="formInput"
              v-model="dayTimeslot.from"
              placeholder="Select start time"
              :picker-options="startTimePickerOptions"
            ></el-time-select>
            <el-time-select
              class="formInput"
              v-model="dayTimeslot.to"
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
import {
  readableTimeslotParser,
  armyTimeToISO,
  getTimeslotFromISO,
  getDayTimeslotFromDayAndTimeslot,
} from "@/common/dateUtils"
import DaySelector from "@/components/utils/DaySelector"

export default {
  beforeMount() {
    const lessonId = this.$route.query["lessonId"]
    if (lessonId) {
      this.edit = true
      const { name } = this.$store.getters.getLessonData(lessonId)
      this.form.name = name
      const dayTimeslots = this.$store.getters.getLessonDayTimeslots(lessonId)
      const parsedTimeSlots = _.map(dayTimeslots, ({ day, timeslot }) => {
        const [from, to] = timeslot.split("/")
        return {
          day,
          from: moment(from).format("HH:mm"),
          to: moment(to).format("HH:mm"),
          key: Math.random(),
        }
      })

      this.form.dayTimeslots = parsedTimeSlots
    }
  },
  components: {
    DaySelector,
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
        dayTimeslots: [
          {
            from: "",
            to: "",
            day: "",
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
          let formData = _.pick(this.form, ["name", "dayTimeslots"])
          formData = {
            ...formData,
            dayTimeslots: _.map(formData.dayTimeslots, ({ day, from, to }) => {
              const parsedFrom = armyTimeToISO(from)
              const parsedTo = armyTimeToISO(to)
              return getDayTimeslotFromDayAndTimeslot(
                day,
                getTimeslotFromISO(parsedFrom, parsedTo)
              )
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
      this.form.dayTimeslots.push({
        key: Date.now(),
        value: "",
      })
    },
  },
}
</script>
