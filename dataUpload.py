import pyrebase
import xlrd
import json

config = {
    "apiKey": "AIzaSyBHWG0CQwlwct1F0-_CnCrjN3r-aYiNuRY",
    "authDomain": "taekwandobackend-d1edf.firebaseapp.com",
    "databaseURL": "https://taekwandobackend-d1edf.firebaseio.com",
    "projectId": "taekwandobackend-d1edf",
    "storageBucket": "taekwandobackend-d1edf.appspot.com",
    "messagingSenderId": "1011970784530"
}
firebase = pyrebase.initialize_app(config)


workbook = xlrd.open_workbook("./data/FILTERED PAYMENT FEE RECORDS 1km.xlsx")

masterList = workbook.sheet_by_name("Master List")
pattern = workbook.sheet_by_name("PATTERN")

remove_all_users = firebase.database().remove()

# usersRef.push({"name": "test"})
for row in range(masterList.nrows):
    if masterList.cell_value(row, 1) != '' and masterList.cell_value(row, 1) != "No.":
        data = {
            "name": masterList.cell_value(row, 2),
            "classType": masterList.cell_value(row, 4),
            "nric": masterList.cell_value(row, 6),
            "address": masterList.cell_value(row, 7),
            "email": masterList.cell_value(row, 8),
            "contact": masterList.cell_value(row, 9),
            "timingSched": masterList.cell_value(row, 11),
            "remarks": masterList.cell_value(row, 12),
            "uniform": masterList.cell_value(row, 13),
            "belt": masterList.cell_value(row, 14),
            "status": "ACTIVE"

        }
        if masterList.cell_value(row, 3) != "":
            data.update({"enrollmentDate": xlrd.xldate_as_datetime(
                masterList.cell_value(row, 3), 0).isoformat()})
        else:
            data.update({
                "enrollmentDate": ""
            })
        if masterList.cell_value(row, 5) != '':
            data.update({
                "dob": xlrd.xldate_as_datetime(masterList.cell_value(row, 5), 0).isoformat(),
            })
        else:
            data.update({
                "dob": '',
            })
        firebase.database().child("Users").push(data)
with open("./data/priceList.json") as f:
    data = json.load(f)
    firebase.database().child("priceList").set(data)
