<template>
  <div id="nav">
    <el-row style="width: 98%;">
      <el-col :span="8" style="padding-top: 7%;">
        <span v-if="loggedIn" id="header">
          <el-select v-model="branchId" disabled>
            <el-option value="1" label="Haig Branch"></el-option>
          </el-select>
        </span>
      </el-col>
      <el-col :offset="1" :span="8">
        <router-link to="/">
          <img src="@/assets/tkdlogo.jpg" style="width: 50%; height: 50%;">
        </router-link>
      </el-col>
      <el-col :span="8"></el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return { branchId: "1" }
  },
  props: {
    loggedIn: {
      type: Boolean,
      required: true,
    },
  },
}
</script>

<style scoped>
#nav {
  display: flex;

  justify-content: space-around;
  padding-bottom: 20px;
}
#header {
  display: flex;
  justify-content: left;
}
</style>
