import pyrebase
import xlrd
import json
import arrow
import dateutil
import datetime

def split(arr, size):
     arrs = []
     while len(arr) > size:
         pice = arr[:size]
         arrs.append(pice)
         arr   = arr[size:]
     arrs.append(arr)
     return arrs

#prod
# config = {
#     "apiKey": "AIzaSyBHWG0CQwlwct1F0-_CnCrjN3r-aYiNuRY",
#     "authDomain": "taekwandobackend-d1edf.firebaseapp.com",
#     "databaseURL": "https://taekwandobackend-d1edf.firebaseio.com",
#     "projectId": "taekwandobackend-d1edf",
#     "storageBucket": "taekwandobackend-d1edf.appspot.com",
#     "messagingSenderId": "1011970784530"
# }

config = {
    "apiKey": "AIzaSyClyjEjuN7tAIodcn1MnWVHLgtsBUcQsBE",
    "authDomain": "taekwandodev.firebaseapp.com",
    "databaseURL": "https://taekwandodev.firebaseio.com",
    "projectId": "taekwandodev",
    "storageBucket": "taekwandodev.appspot.com",
    "messagingSenderId": "198973657637"
}
firebase = pyrebase.initialize_app(config)


workbook = xlrd.open_workbook("./data/KATONG STUDENTS RECORDS V4.xlsx")

masterList = workbook.sheet_by_name("RECORDS")

remove_all = firebase.database().remove()


lessonsData = {}    

for row in range(1,masterList.nrows):
    start = 0
    lessonRows = masterList.row_values(row, 12)
    finished = False
    lessonsStudentIsIn = []
   
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
        if lessonName == '-' or "ADVANCE" in lessonName:
            continue
        if ("UNLIMITIED" in lessonName or "UNLIMITED" in lessonName):
            lessonName = lesson[0].split()[0]
        if lessonsData.get(lessonName) == None:
            lessonsData.update({
                lessonName: {"dayTimeslots": set()}
            })  
        lessonDay = lesson[2][:3]


        timeslotArray = lesson[3].split("-")

        startingTime = timeslotArray[0][:2]
        if startingTime == "":
            continue
        endingTime = timeslotArray[1][0:-2]
        endingAmPm = timeslotArray[1][-2:]
        startingAmPm = endingAmPm
        if (str(endingTime)) == "12":
            if endingAmPm == "PM":
                startingAmPm = "AM"
        startTime = str(arrow.get(startingTime+startingAmPm, "hA").replace(year=2018).shift(hours=-8))[:-6]+".000Z"
        endTime = str(arrow.get(endingTime+endingAmPm, "hA").replace(year=2018).shift(hours=-8))[:-6]+".000Z"
        lessonsData[lessonName]["dayTimeslots"].add(lessonDay+"|"+startTime+"/"+endTime)

for key, val in lessonsData.items():
    lessonsData[key].update({"name":key, "dayTimeslots": list(lessonsData[key]["dayTimeslots"])})
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
        "email": masterList.cell_value(row, 7),
        "address": masterList.cell_value(row, 5) + postalCode,
        "nric": masterList.cell_value(row, 4),
        "nationality": masterList.cell_value(row, 9),
        "status": "ACTIVE"

    }
    if type(masterList.cell_value(row, 8)) == str:
        data.update({"contact": masterList.cell_value(row, 8)})
    else:
        data.update({"contact": str(int(masterList.cell_value(row, 8)))})

    if masterList.cell_value(row, 3) != "":
        data.update({"dob": xlrd.xldate_as_datetime(
            masterList.cell_value(row, 3), 0).isoformat()})
    else:
        data.update({
            "dob": ""
        })
    if masterList.cell_value(row, 2) != '': 
        data.update({
            "enrollmentDate": xlrd.xldate_as_datetime(masterList.cell_value(row, 2), 0).isoformat(),
        })
    else:
        data.update({
            "enrollmentDate": '',
        })
    start = 0
    if masterList.cell_value(row, 10) != "NIL":
        if type(masterList.cell_value(row, 10)) == str:
            print(masterList.cell_value(row, 10))
            lastPayment= str(arrow.get(masterList.cell_value(row, 10), "DD/MM/YYYY"))
        else:
            lastPayment = xlrd.xldate_as_datetime(masterList.cell_value(row, 10), 0).isoformat()
    else:
        lastPayment = {}



    if masterList.cell_value(row, 11) != "NIL":
        if type(masterList.cell_value(row, 11)) == str:
            expectPayment= str(arrow.get(masterList.cell_value(row, 11), "DD/MM/YYYY"))
        else:
            expectPayment = xlrd.xldate_as_datetime(masterList.cell_value(row, 11), 0).isoformat()
    else:
        expectPayment = {}
    lessonRows = masterList.row_values(row, 12)
    finished = False
    lessonsStudentIsIn = []
   
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
        if lesson[0] == '-' or "ADVANCE" in lesson[0]:
            continue
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
        if (str(endingTime)) == "12":
            if endingAmPm == "PM":
                startingAmPm = "AM"
        if len(startingTime) == 1:
            startingTime = "0"+startingTime
        if len(endingTime) == 1:
            endingTime = "0"+endingTime
        startTime = str(arrow.get(startingTime+startingAmPm, "hA").replace(year=2018).shift(hours=-8))[:-6]+".000Z"
        endTime = str(arrow.get(endingTime+endingAmPm, "hA").replace(year=2018).shift(hours=-8))[:-6]+".000Z"

        timeslot = startTime+"/"+endTime
        if "UNLIMITIED" in lessonRows[0] or "UNLIMITED" in lessonRows[0]:
            lessonPayload = {lessonToBeAdded: {"lastPayment": lastPayment, "expectPayment": expectPayment, "paymentPlan": paymentPlan, "entitlement": entitlement, "timeslot": "UNLIMITED"}}
        else:
            lessonPayload = {lessonToBeAdded: {"lastPayment": lastPayment, "expectPayment": expectPayment, "paymentPlan": paymentPlan, "entitlement": entitlement, "day": lesson[2][:3], "timeslot": timeslot}}
        parsedLessonPayload.update(lessonPayload)
    data.update({"lessons": parsedLessonPayload})
    userId = firebase.database().child("Users").push(data)["name"]
    for key, val in parsedLessonPayload.items():
        firebase.database().child("Lessons").child(key).child("Users").push(userId)
