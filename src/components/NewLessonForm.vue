<template>
    <div class="formDiv">
        <el-form :model="form" class="form" label-position="top" size="medium" ref="form">
            <el-form-item label="Lesson Name" class="formItem">
                <el-input
                    placeholder="Please input lesson name"
                    v-model="form.name"
                    class="formInput"
                ></el-input>
            </el-form-item>
            <el-form-item label="Days:" class="formItem">
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
            <el-form-item label="From:" class="formItem">
                <el-time-picker
                    class="formInput"
                    v-model="form.from"
                    placeholder="Select start time"
                    :picker-options="timePickerOptions"
                ></el-time-picker>
            </el-form-item>
            <el-form-item label="To:" class="formItem">
                <el-time-picker class="formInput" v-model="form.to" placeholder="Select end time"></el-time-picker>
            </el-form-item>
            <el-form-item label="Price:" class="formItem">
                <el-input
                    placeholder="Please input price"
                    type="number"
                    class="formInput"
                    v-model="form.price"
                ></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="createNewLesson()">Submit</el-button>
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
    }
  },
  methods: {
    createNewLesson() {
      let formData = _.pick(this.form, ["name", "days", "from", "to", "price"])
      formData = {
        ...formData,
        to: moment(formData.to).toISOString(),
        from: moment(formData.from).toISOString(),
      }
      this.$store.dispatch("createNewLesson", formData)
      this.$router.push({
        name: "home",
      })
    },
  },
}
</script>
