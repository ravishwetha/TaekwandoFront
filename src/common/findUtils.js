import _ from "lodash"
import { getDayTimeslotToObject } from "./dateUtils"

const dfsKeysArrayUncleaned = (object, keyToSearch, appendedArray = []) => {
  if (!(object instanceof Object)) {
    return null
  }
  if (object[keyToSearch]) {
    return [...appendedArray, keyToSearch]
  }

  return _.compact(
    _.map(object, (val, objKey) =>
      dfsKeysArrayUncleaned(val, keyToSearch, [...appendedArray, objKey])
    )
  )
}

export const dfsKeysArray = (object, keyToSearch) => {
  const dfsArray = dfsKeysArrayUncleaned(object, keyToSearch)
  const cleanedKeysArray = _.compact(
    _.map(dfsArray, (dfsArray) => (dfsArray.length > 0 ? dfsArray : null))
  )
  return _.flattenDeep(cleanedKeysArray)
}

export const dayInDayTimeslotArray = (dayTimeslot, day) =>
  getDayTimeslotToObject(dayTimeslot)[day] !== undefined
