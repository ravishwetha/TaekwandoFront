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

export const DATEANDTIME = "DD-MM-YY, h:mma"
