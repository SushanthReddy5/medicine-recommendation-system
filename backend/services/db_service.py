from pymongo import MongoClient, DESCENDING
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/mediassist")

class DBService:
    def __init__(self):
        self.client       = None
        self.db           = None
        self.history      = None
        self.is_connected = False
        self._connect()

    def _connect(self):
        try:
            self.client       = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
            self.client.server_info()
            self.db           = self.client["mediassist"]
            self.history      = self.db["search_history"]
            self.is_connected = True
            print("✅ MongoDB connected")
        except Exception as e:
            print(f"⚠️  MongoDB not connected: {e}")

    def save_search(self, symptoms, predictions, method):
        if not self.is_connected:
            return None
        try:
            doc = {
                "symptoms"    : symptoms,
                "predictions" : predictions,
                "method"      : method,
                "top_disease" : predictions[0]["disease"]  if predictions else None,
                "top_medicine": predictions[0]["medicine"] if predictions else None,
                "top_severity": predictions[0]["severity"] if predictions else None,
                "timestamp"   : datetime.utcnow(),
            }
            result = self.history.insert_one(doc)
            return str(result.inserted_id)
        except Exception as e:
            print(f"❌ Save failed: {e}")
            return None

    def get_history(self, limit=10):
        if not self.is_connected:
            return []
        try:
            docs = self.history.find(
                {}, {"_id": 1, "symptoms": 1, "top_disease": 1,
                     "top_medicine": 1, "timestamp": 1, "method": 1}
            ).sort("timestamp", DESCENDING).limit(limit)
            results = []
            for d in docs:
                d["_id"]       = str(d["_id"])
                d["timestamp"] = d["timestamp"].isoformat()
                results.append(d)
            return results
        except Exception as e:
            print(f"❌ Fetch failed: {e}")
            return []

    def clear_history(self):
        if not self.is_connected:
            return False
        try:
            self.history.delete_many({})
            return True
        except Exception as e:
            print(f"❌ Clear history failed: {e}")
            return False

    def get_stats(self):
        if not self.is_connected:
            return {}
        try:
            total = self.history.count_documents({})
            top_diseases = list(self.history.aggregate([
                {"$group": {"_id": "$top_disease", "count": {"$sum": 1}}},
                {"$sort" : {"count": -1}},
                {"$limit": 5}
            ]))
            top_symptoms = list(self.history.aggregate([
                {"$project": {"symptoms": {"$split": ["$symptoms", ", "]}}},
                {"$unwind" : "$symptoms"},
                {"$group"  : {"_id": "$symptoms", "count": {"$sum": 1}}},
                {"$sort"   : {"count": -1}},
                {"$limit"  : 5}
            ]))
            return {
                "total_searches": total,
                "top_diseases"  : [{"disease": d["_id"], "count": d["count"]} for d in top_diseases],
                "top_symptoms"  : [{"symptom": s["_id"], "count": s["count"]} for s in top_symptoms],
            }
        except Exception as e:
            print(f"❌ Stats failed: {e}")
            return {}

    def get_dashboard_stats(self):
        if not self.is_connected:
            return {}
        try:
            total = self.history.count_documents({})

            top_diseases = list(self.history.aggregate([
                {"$group": {"_id": "$top_disease", "count": {"$sum": 1}}},
                {"$sort" : {"count": -1}},
                {"$limit": 5}
            ]))

            top_medicines = list(self.history.aggregate([
                {"$group": {"_id": "$top_medicine", "count": {"$sum": 1}}},
                {"$sort" : {"count": -1}},
                {"$limit": 5}
            ]))

            severity_dist = list(self.history.aggregate([
                {"$group": {"_id": "$top_severity", "count": {"$sum": 1}}},
                {"$sort" : {"count": -1}}
            ]))

            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            daily_searches = list(self.history.aggregate([
                {"$match": {"timestamp": {"$gte": seven_days_ago}}},
                {"$group": {
                    "_id"  : {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                    "count": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}}
            ]))

            top_symptoms = list(self.history.aggregate([
                {"$project": {"symptoms": {"$split": ["$symptoms", ", "]}}},
                {"$unwind" : "$symptoms"},
                {"$group"  : {"_id": "$symptoms", "count": {"$sum": 1}}},
                {"$sort"   : {"count": -1}},
                {"$limit"  : 5}
            ]))

            return {
                "total_searches": total,
                "top_diseases"  : [{"disease" : d["_id"], "count": d["count"]} for d in top_diseases],
                "top_medicines" : [{"medicine": m["_id"], "count": m["count"]} for m in top_medicines],
                "severity_dist" : [{"severity": s["_id"], "count": s["count"]} for s in severity_dist],
                "daily_searches": [{"date": d["_id"], "count": d["count"]} for d in daily_searches],
                "top_symptoms"  : [{"symptom": s["_id"], "count": s["count"]} for s in top_symptoms],
            }
        except Exception as e:
            print(f"❌ Dashboard stats failed: {e}")
            return {}

db_service = DBService()
