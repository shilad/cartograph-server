import pandas as pd
import json
import ast
from datetime import datetime
import glob
import os
import math
users = {}

activities = []
study_results = []

path = '../data/geography/0012/logs/'
switchTimes = []
responses = []
survey = []
for filename in glob.glob(os.path.join(path, '*.tsv')):
    for line in open(os.path.join(os.getcwd(), filename)):
        curLine = ast.literal_eval(line)
        formid = 0
        uid = curLine["uid"]
        if uid not in users.keys():
            users[uid] = []
        # an event either is an activity or analyze_study_logs output
        if "event" in curLine.keys():
            event = curLine["event"]
        if "formid" in curLine.keys():
            formid = curLine["formid"]
            if formid[0:6] == "custom":
                survey.append(curLine["values"])
            else:
                switchTimes.append({"time": curLine["tstamp"], "event": formid})
                curLine["values"]["uid"] = uid
                responses.append(curLine["values"])

        if "messages" in curLine.keys():
            message = curLine["messages"]
            for count in message:
                event = count["event"]
                begZoom = count["begZoom"]
                endZoom = count["endZoom"]
                # by how much this action zoomed
                zoomAct = endZoom / begZoom

                begTstamp = count["begTstamp"]
                endTstamp = count["endTstamp"]
                begDt = datetime.fromtimestamp(begTstamp/1000)
                endDt = datetime.fromtimestamp(endTstamp / 1000)
                # how long this action lasted
                timeElapsed = (endDt - begDt).total_seconds()

                begLat = count["begLat"]
                endLat = count["endLat"]
                begLng = count["begLng"]
                endLng = count["endLng"]
                # how much a range this motion lasted.
                squaredSum = math.pow(float(endLng) - float(begLng), 2) + math.pow(float(endLat) - float(begLat), 2)
                motionRange = math.sqrt(squaredSum)
                if motionRange != 0 or zoomAct != 1 or timeElapsed != 0:
                    activities.append({"uid": uid,
                                       "zoomAct": zoomAct,
                                       "timeElapsed": timeElapsed,
                                       "begTStamp": begTstamp,
                                       "motionRange": motionRange,
                                       "actionName": event})

df = pd.DataFrame(activities)
df.to_csv("user_study_activity.csv")
pd.DataFrame(switchTimes).to_csv("switch_times.csv")

print(pd.DataFrame(responses))
print(pd.DataFrame(survey))
