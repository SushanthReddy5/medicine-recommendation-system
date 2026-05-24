import os
import json

BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
DATA_PATH     = os.path.join(BASE_DIR, '..', 'drug_interactions.json')

SEVERITY_RANK = {"high": 3, "moderate": 2, "low": 1}

class InteractionService:
    def __init__(self):
        self.interactions = []
        self._load()

    def _load(self):
        try:
            with open(DATA_PATH, 'r') as f:
                data = json.load(f)
                self.interactions = data.get("interactions", [])
            print(f"✅ Drug interactions loaded: {len(self.interactions)} pairs")
        except Exception as e:
            print(f"❌ Interaction data load failed: {e}")

    def check(self, medicines: list):
        """
        Check interactions between a list of medicines.
        Returns list of interaction warnings sorted by severity.
        """
        medicines_clean = [m.strip().lower() for m in medicines]
        found = []

        for item in self.interactions:
            d1 = item["drug1"].lower()
            d2 = item["drug2"].lower()
            # Check both directions
            if d1 in medicines_clean and d2 in medicines_clean:
                found.append({
                    "drug1"      : item["drug1"],
                    "drug2"      : item["drug2"],
                    "severity"   : item["severity"],
                    "description": item["description"],
                })

        # Sort by severity — high first
        found.sort(key=lambda x: SEVERITY_RANK.get(x["severity"], 0), reverse=True)
        return found

    def get_all_medicines(self):
        """Return all unique medicine names in the database."""
        meds = set()
        for item in self.interactions:
            meds.add(item["drug1"])
            meds.add(item["drug2"])
        return sorted(meds)

interaction_service = InteractionService()
