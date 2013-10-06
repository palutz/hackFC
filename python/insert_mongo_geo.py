import json, feedparser, requests
from pymongo import MongoClient, GEOSPHERE
from datetime import datetime,timedelta
from time import mktime


def load(filename, eventType):
	#db = MongoClient("mongodb://hackfc:hackfc@ds027748.mongolab.com:27748/hackfc")
	connection = MongoClient("ds027748.mongolab.com", 27748)
	db = connection["hackfc"]
	# MongoLab has user authentication
	db.authenticate("hackfc", "hackfc")


	db.events.ensure_index([("loc", GEOSPHERE)])
	db.events.ensure_index('ev_type', 1)
	db.events.ensure_index('ts', 1)

	with open(filename, 'r') as fin:
		for line in fin:

			pieces = line.split(',')

			if((float(pieces[3]) != 0) and (float(pieces[2]) != 0)):

				when = mktime(datetime.strptime(pieces[0], '%d/%m/%Y %H:%M').timetuple())*1000

				db.events.insert({
					"ev_type" : eventType,
					"loc" : {'type': 'Point', 'coordinates': [float(pieces[3]), float(pieces[2])] },
					"road" : pieces[1],
					"ts" : when,
					"amount" : 1
					})

def loadAS(filename):
	#db = MongoClient("mongodb://hackfc:hackfc@ds027748.mongolab.com:27748/hackfc")
	connection = MongoClient("ds027748.mongolab.com", 27748)
	db = connection["hackfc"]
	# MongoLab has user authentication
	db.authenticate("hackfc", "hackfc")

	db.events.ensure_index([("loc", GEOSPHERE)])
	db.events.ensure_index('ev_type', 1)
	db.events.ensure_index('ts', 1)
	with open(filename, 'r') as fin:
		for line in fin:

			pieces = line.split(',')

			if((float(pieces[3]) != 0) and (float(pieces[2]) != 0)):
				when = mktime(datetime.strptime(pieces[0], '%d/%m/%Y %H:%M').timetuple())*1000
				event_types = []
				if pieces[6].lower() == 'yes':
					event_types.append('vomit')
				if pieces[7].lower() == 'yes':
					event_types.append('huf')
				if pieces[8].lower() == 'yes':
					event_types.append('blood')
				if pieces[9].lower() == 'yes':
					event_types.append('urine')

				for et in event_types:
					db.events.insert({
						"ev_type" : et,
						"loc" : {'type': 'Point', 'coordinates': [float(pieces[3]), float(pieces[2])] },
						"road" : pieces[1],
						"ts" : when,
						"amount" : 1
					})



if __name__ == "__main__" :
	load('Dog.csv','duf')
	load('Graffiti.csv','grf')
	loadAS('AntiSocialBehavior.csv')
