import _ from "lodash"
import { DAYS } from "./data"
import moment from "moment"

// Each object must have a "day" key in it
export const sortByDay = (collection) =>
  _.sortBy(collection, ({ day }) => DAYS[day])

// Each object must have a "from" key in it
export const sortByFrom = (collection) =>
  _.sortBy(collection, ({ from }) => moment(from).unix())

export const sortByFromArmyTime = (collection) =>
  _.sortBy(collection, ({ from }) => moment(from, "HH:mm").unix())
