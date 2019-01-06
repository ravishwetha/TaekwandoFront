<template>
  <div>
    <el-button @click="updateAutoDeductionStatus(false)" type="primary" v-if="autoDeduction">
      <span>Disable Auto Deduction</span>
    </el-button>
    <el-button @click="updateAutoDeductionStatus(true)" v-else type="primary">
      <span>Enable Auto Deduction</span>
    </el-button>
    <el-button
      :disabled="this.customerDetails !== undefined"
      @click="registrationDialogVisible = true"
      type="primary"
    >
      <span v-if="this.customerDetails !== undefined">Card is already registered</span>
      <span v-else>Register</span>
    </el-button>
    <el-button
      @click="unregisterCard"
      type="warning"
      v-if="this.customerDetails !== undefined"
    >Remove registered card</el-button>
    <el-dialog
      title="Register your credit/debit card"
      :show-close="!this.registrationLoading"
      :close-on-click-modal="!this.registrationLoading"
      :close-on-press-escape="this.registrationLoading"
      :visible.sync="registrationDialogVisible"
    >
      <span>If card input does not appear, reload the page.</span>
      <card :stripe="stripeKey"></card>
      <span slot="footer">
        <el-button :loading="this.registrationLoading" type="primary" @click="registerCard">Register</el-button>
        <el-button
          v-if="!this.registrationLoading"
          @click="registrationDialogVisible = false"
        >Cancel</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { Card, createToken } from "vue-stripe-elements-plus"

export default {
  components: {
    Card,
  },

  computed: {
    customerDetails() {
      const details = this.$store.getters.getStudentInfo(this.userId)
      return details.customer
    },
    autoDeduction() {
      return this.$store.getters.getStudentInfo(this.userId).autoDeduction
    },
  },
  data() {
    return {
      registrationDialogVisible: false,
      registrationLoading: false,
      stripeKey: process.env.VUE_APP_STRIPE_KEY,
    }
  },
  methods: {
    async registerCard() {
      this.registrationLoading = true
      const cardToken = await createToken()
      if (cardToken.error) {
        this.$notify.error({
          title: "Card Error",
          message: cardToken.error.message,
        })
        this.registrationLoading = false
        this.registrationDialogVisible = false
        return
      }
      await this.$store.dispatch("registerCard", {
        userId: this.userId,
        cardToken: cardToken.token.id,
        vm: this,
      })
      this.registrationLoading = false
      this.registrationDialogVisible = false
    },
    async unregisterCard() {
      this.registrationLoading = true
      await this.$store.dispatch("unregisterCard", {
        userId: this.userId,
      })
      this.$notify.success({
        title: "Success",
        message: "Card has been unregistered",
      })
      this.registrationLoading = false
      this.registrationDialogVisible = false
    },
    async updateAutoDeductionStatus(status) {
      this.$store.dispatch("autoDeductionStatus", {
        userId: this.userId,
        autoDeduction: status,
      })
    },
  },
  props: {
    userId: {
      type: String,
      required: true,
    },
  },
}
</script>

<style>
</style>
