import pyrebase
import xlrd
import json
import arrow
import dateutil

def split(arr, size):
     arrs = []
     while len(arr) > size:
         pice = arr[:size]
         arrs.append(pice)
         arr   = arr[size:]
     arrs.append(arr)
     return arrs

config = {
    "apiKey": "AIzaSyBHWG0CQwlwct1F0-_CnCrjN3r-aYiNuRY",
    "authDomain": "taekwandobackend-d1edf.firebaseapp.com",
    "databaseURL": "https://taekwandobackend-d1edf.firebaseio.com",
    "projectId": "taekwandobackend-d1edf",
    "storageBucket": "taekwandobackend-d1edf.appspot.com",
    "messagingSenderId": "1011970784530"
}
firebase = pyrebase.initialize_app(config)


workbook = xlrd.open_workbook("./data/KATONG STUDENTS RECORDS.xlsx")

masterList = workbook.sheet_by_name("RECORDS")

remove_all = firebase.database().remove()


lessonsData = {}    

for row in range(1,masterList.nrows):
    start = 0
    lessonRows = masterList.row_values(row, 10)
    finished = False
    lessonsStudentIsIn = []
    if lessonRows[0] == '-' or "UNLIMITIED" in lessonRows[0] or "UNLIMITED" in lessonRows[0] or "ADVANCE" in lessonRows[0]:
        continue
    for j in range(4):
        for i in range(4):
            data = lessonRows[start*4+i]
            lessonsStudentIsIn.append(data)
            if str(data).strip() == '':
                finished = True
                break
        start += 1
    lessonsStudentIsIn = split(lessonsStudentIsIn, 4)[:-1]
    for lesson in lessonsStudentIsIn:
        lessonName = lesson[0]
        if lessonsData.get(lessonName) == None:
            lessonsData.update({
                lessonName: {"days": set(), "timeslots": set()}
            })
        lessonsData[lessonName]["days"].add(lesson[2])
        timeslotArray = lesson[3].split("-")
        startingTime = timeslotArray[0][:2]
        if startingTime == "":
            continue
        endingTime = timeslotArray[1][0:-2]
        endingAmPm = timeslotArray[1][-2:]
        startingAmPm = endingAmPm
        if (str(endingTime)) == 12:
            if endingAmPm == "PM":
                startingAmPm = "AM"
            else:
                endingAmPm = "PM"
        startTime = str(arrow.get(startingTime+startingAmPm, "hA").replace(tzinfo=dateutil.tz.gettz("GMT+8")))
        endTime = str(arrow.get(endingTime+endingAmPm, "hA").replace(tzinfo=dateutil.tz.gettz("GMT+8")))
        lessonsData[lessonName]["timeslots"].add(startTime+"/"+endTime)

for key, val in lessonsData.items():
    lessonsData[key].update({"name":key, "days": list(lessonsData[key]["days"]), "timeslots": list(lessonsData[key]["timeslots"])})
    firebase.database().child("Lessons").push(lessonsData[key])

with open("./data/priceList.json") as f:
    data = json.load(f)
    firebase.database().child("priceList").set(data)

firebaseLessons = firebase.database().child("Lessons").get().val()

for row in range(1,masterList.nrows):

    postalCode = masterList.cell_value(row, 6)
    if (postalCode != ''):
        postalCode =  " " + str(int(masterList.cell_value(row, 6)))
    data = {
        "name": masterList.cell_value(row, 1),
        "email": masterList.cell_value(row, 4),
        "address": masterList.cell_value(row, 5) + postalCode,
        "nric": masterList.cell_value(row, 7),
        "nationality": masterList.cell_value(row, 9),
        "status": "ACTIVE"

    }
    if type(masterList.cell_value(row, 3)) == str:
        data.update({"contact": masterList.cell_value(row, 3)})
    else:
        data.update({"contact": str(int(masterList.cell_value(row, 3)))})

    if masterList.cell_value(row, 2) != "":
        data.update({"dob": xlrd.xldate_as_datetime(
            masterList.cell_value(row, 2), 0).isoformat()})
    else:
        data.update({
            "dob": ""
        })
    if masterList.cell_value(row, 8) != '':
        data.update({
            "enrollmentDate": xlrd.xldate_as_datetime(masterList.cell_value(row, 8), 0).isoformat(),
        })
    else:
        data.update({
            "enrollmentDate": '',
        })
    start = 0
    lessonRows = masterList.row_values(row, 10)
    finished = False
    lessonsStudentIsIn = []
    if lessonRows[0] == '-' or "UNLIMITIED" in lessonRows[0] or "UNLIMITED" in lessonRows[0] or "ADVANCE" in lessonRows[0]:
        continue
    for j in range(4):
        for i in range(4):
            cellData = lessonRows[start*4+i]
            lessonsStudentIsIn.append(cellData)
            if str(cellData).strip() == '':
                finished = True
                break
        start += 1
    lessonsStudentIsIn = split(lessonsStudentIsIn, 4)[:-1]
    parsedLessonPayload = {}
    for lesson in lessonsStudentIsIn:
        paymentPlan = int(lesson[1])
        entitlement = int(lesson[1])
        firstWordLessonName = lesson[0].split(" ")[0].split("/")[0]
        lessonToBeAdded = None
        for key, val in firebaseLessons.items():
            if firstWordLessonName in val["name"]:
                lessonToBeAdded = key
                break
        timeslotArray = lesson[3].split("-")
        startingTime = timeslotArray[0][:2]
        if startingTime == "":
            continue
        endingTime = timeslotArray[1][0:-2]
        endingAmPm = timeslotArray[1][-2:]
        startingAmPm = endingAmPm
        if (str(endingTime)) == 12:
            if endingAmPm == "PM":
                startingAmPm = "AM"
            else:
                endingAmPm = "PM"
        startTime = str(arrow.get(startingTime+startingAmPm, "hA").replace(tzinfo=dateutil.tz.gettz("GMT+8")))
        endTime = str(arrow.get(endingTime+endingAmPm, "hA").replace(tzinfo=dateutil.tz.gettz("GMT+8")))
        timeslot = startTime+"/"+endTime
        lessonPayload = {lessonToBeAdded: {"paymentPlan": paymentPlan, "entitlement": entitlement, "day": lesson[2][:3], "timeslot": timeslot}}
        parsedLessonPayload.update(lessonPayload)
    data.update({"lessons": parsedLessonPayload})
    userId = firebase.database().child("Users").push(data)["name"]
    for key, val in parsedLessonPayload.items():
        firebase.database().child("Lessons").child(key).child("Users").push(userId)
