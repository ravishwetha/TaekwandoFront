import moment from "moment"
export const readableTimeslotParser = (timeslot) => {
  if (timeslot === "UNLIMITED") {
    return "UNLIMITED"
  }
  const [from, to] = timeslot.split("/")
  const timingFrom = moment(from).format("h:mma")
  const timingTo = moment(to).format("h:mma")
  return timingFrom + " - " + timingTo
}

export const timeslotToMoment = (timeslot) => {
  const [from, to] = timeslot.split("/")
  const timingFrom = moment(from)
  const timingTo = moment(to)
  return {
    from: timingFrom,
    to: timingTo,
  }
}

export const timeslotInArray = (timeslots, timeslotToFind) => {
  return _.find(
    timeslots,
    (timeslot) =>
      readableTimeslotParser(timeslot) ===
      readableTimeslotParser(timeslotToFind)
  )
}

export const getDayTimeslotToObject = (dayTimeslots) => {
  let dayTimeslotsObject = {}
  dayTimeslots.forEach((dayTimeslot) => {
    const [day, timeslot] = dayTimeslot.split("|")
    if (dayTimeslotsObject[day] === undefined) {
      dayTimeslotsObject[day] = []
    }
    dayTimeslotsObject[day].push(timeslot)
  })
  return dayTimeslotsObject
}

export const DATEANDTIME = "DD-MM-YY, h:mma"
