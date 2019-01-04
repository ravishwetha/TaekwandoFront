<template>
  <div>
    <el-dialog
      title="Payments due"
      :visible="paymentDialogVisible"
      @close="(event) => $emit('close', event)"
    >
      <p>Select a date to view payments due:</p>
      <date-selector single v-model="selectedDate"></date-selector>
      <el-table max-height="500" :data="studentPaymentData" style="width: 90%">
        <el-table-column prop="studentName" label="Name"></el-table-column>
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-table
              :show-summary="true"
              sum-text="Total Payments Due"
              :data="props.row.expectedPaymentArray"
            >
              <el-table-column label="Lesson Name" prop="lessonName"></el-table-column>
              <el-table-column label="Price" prop="price"></el-table-column>
              <el-table-column label="Operations" fixed="right">
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="small"
                    @click="openUpdateExpectPaymentDialog(scope.row, props.row.userId)"
                  >Edit</el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog
      title="Update new expected payment date"
      :visible.sync="expectPaymentEditDialogVisible"
    >
      <p>Next expected payment date:</p>
      <date-selector single v-model="updatedFields.updatedExpectPaymentDate"></date-selector>
      <p>Price to charge:</p>
      <el-input type="number" label="Price:" v-model="updatedFields.updatedExpectPaymentPrice"></el-input>
      <span slot="footer">
        <el-button type="primary" @click="updateExpectedPaymentDateAndPrice()">Update</el-button>
        <el-button @click="expectPaymentEditDialogVisible = false">Cancel</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash"
import moment from "moment"
import DateSelector from "@/components/utils/DateSelector"
import { dfsKeysArray } from "@/common/findUtils"
import { UNLIMITED, ONCE } from "../../common/data"

export default {
  props: {
    paymentDialogVisible: {
      type: Boolean,
      required: true,
    },
  },
  components: {
    DateSelector,
  },
  computed: {
    studentPaymentData() {
      const allUsers = this.$store.getters.getAllStudentsInfo
      const usersToExpectedPaymentObject = _.map(allUsers, (user) => {
        const lessonsUsersAreIn = _.get(user, "lessons", {})
        let expectedPaymentArray = []
        _.forEach(lessonsUsersAreIn, (lessonIn, lessonId) => {
          if (
            lessonIn.expectPayment &&
            this.selectedDate &&
            moment(lessonIn.expectPayment)
              .startOf("day")
              .isSame(moment(this.selectedDate).startOf("day"))
          ) {
            const lessonToPayFor = this.$store.getters.getLessonData(lessonId)
            const keyArray = dfsKeysArray(
              this.$store.getters.getPriceList,
              lessonToPayFor.name
            )
            const priceList = this.$store.getters.getPriceListFromKeyArray(
              keyArray
            )
            let sessionsPrice = priceList
            if (lessonIn.timeslot === UNLIMITED) {
              sessionsPrice = sessionsPrice[UNLIMITED]
            } else {
              sessionsPrice = sessionsPrice[ONCE]
                ? sessionsPrice[ONCE]
                : sessionsPrice
            }
            const price = lessonIn.price
              ? lessonIn.price
              : sessionsPrice[lessonIn.paymentPlan]
            expectedPaymentArray.push({
              price,
              lessonName: lessonToPayFor.name,
              lessonId,
              expectPayment: lessonIn.expectPayment,
            })
          }
        })
        return {
          userId: user.userId,
          studentName: this.$store.getters.getStudentInfo(user.userId).name,
          expectedPaymentArray,
        }
      })

      return _.filter(
        usersToExpectedPaymentObject,
        (paymentObject) => paymentObject.expectedPaymentArray.length > 0
      )
    },
  },
  data() {
    return {
      selectedDate: moment(),
      expectPaymentEditDialogVisible: false,
      updatedFields: {
        updatedExpectPaymentUserId: "",
        updatedExpectPaymentDate: "",
        updatedExpectPaymentPrice: "",
        updatedExpectPaymentLessonId: "",
      },
    }
  },
  methods: {
    updateExpectedPaymentDateAndPrice() {
      const {
        updatedExpectPaymentDateLessonId,
        updatedExpectPaymentPrice,
        updatedExpectPaymentDate,
        updatedExpectPaymentUserId,
      } = this.updatedFields
      const expectPayment = moment(updatedExpectPaymentDate).toISOString()
      this.$store.dispatch("updateExpectPaymentDateAndPrice", {
        userId: updatedExpectPaymentUserId,
        lessonId: updatedExpectPaymentDateLessonId,
        expectPayment,
        price: Number.parseInt(updatedExpectPaymentPrice),
      })
      this.expectPaymentEditDialogVisible = false
      // },
    },
    openUpdateExpectPaymentDialog(row, userId) {
      this.updatedFields.updatedExpectPaymentDateLessonId = row.lessonId
      this.updatedFields.updatedExpectPaymentDate = moment(row.expectPayment)
      this.updatedFields.updatedExpectPaymentPrice = row.price
      this.updatedFields.updatedExpectPaymentUserId = userId
      this.expectPaymentEditDialogVisible = true
    },
  },
}
</script>

<style>
</style>
