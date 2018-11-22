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
          <el-checkbox label="Monday" name="type"></el-checkbox>
          <el-checkbox label="Tuesday" name="type"></el-checkbox>
          <el-checkbox label="Wednesday" name="type"></el-checkbox>
          <el-checkbox label="Thursday" name="type"></el-checkbox>
          <el-checkbox label="Friday" name="type"></el-checkbox>
          <el-checkbox label="Saturday" name="type"></el-checkbox>
          <el-checkbox label="Sunday" name="type"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="From:" class="formItem" prop="from">
        <el-time-picker
          class="formInput"
          v-model="form.from"
          placeholder="Select start time"
          :picker-options="timePickerOptions"
        ></el-time-picker>
      </el-form-item>
      <el-form-item label="To:" class="formItem" prop="to">
        <el-time-picker class="formInput" v-model="form.to" placeholder="Select end time"></el-time-picker>
      </el-form-item>
      <el-form-item label="Price:" class="formItem" prop="price">
        <el-input
          placeholder="Please input price"
          type="number"
          class="formInput"
          v-model="form.price"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="createNewLesson('form')">Submit</el-button>
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
        from: "",
        to: "",
        price: "",
      },
      rules: {
        name: [
          {
            required: true,
            message: "Please input Activity name",
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
            message: "Please select Activity zone",
            trigger: "change",
          },
        ],
        from: [
          {
            type: "date",
            required: true,
            message: "Please pick a lesson start time",
            trigger: "change",
          },
        ],
        to: [
          {
            type: "date",
            required: true,
            message: "Please pick a lesson end time",
            trigger: "change",
          },
        ],
        price: [
          {
            required: true,
            message: "Please input a price",
            trigger: "change",
          },
        ],
      },
    }
  },
  methods: {
    createNewLesson(formName) {
      this.$refs[formName].validate()
      let formData = _.pick(this.form, ["name", "days", "from", "to", "price"])
      formData = {
        ...formData,
        to: moment(formData.to).toISOString(),
        from: moment(formData.from).toISOString(),
      }
      //   this.$store.dispatch("createNewLesson", formData)
      //   this.$router.push({
      //     name: "home",
      //   })
    },
  },
}
</script>
