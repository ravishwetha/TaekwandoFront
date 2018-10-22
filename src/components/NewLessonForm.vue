<template>
    <div class="formDiv">
        <el-form :model="form" class="form" label-position="top" size="medium">
            <el-form-item label="Lesson Name" class="formItem">
                <el-input v-model="form.name" class="formInput"></el-input>
            </el-form-item>
            <el-form-item label="Frequency:" class="formItem">
                <br>
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
                <el-input-number class="formInput" v-model="price" :precision="2" controls="false"></el-input-number>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: "",
        days: [],
        from: "",
        to: "",
        price: 0,
      },
    }
  },
}
</script>

<style scoped>
/* .formItem {
  display: flex;
  flex-direction: column;
  justify-content: center;
  justify-self: center;
}

.formInput {
  display: flex;
  justify-content: center;
} */
</style>
