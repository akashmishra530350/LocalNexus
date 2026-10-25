import os
import re
import math
from typing import List, Dict, Any, Tuple
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics.pairwise import cosine_similarity

# Category definitions and department mapping
CATEGORY_DEPARTMENT_MAP = {
    "Roads & Potholes": "Roads & Infrastructure",
    "Waste Management & Garbage": "Sanitation & Solid Waste",
    "Water Supply & Leakage": "Water Works & Supply",
    "Drainage & Sewage": "Sewage & Stormwater Drainage",
    "Streetlights & Electricity": "Electrical & Public Lighting",
    "Public Health & Sanitation": "Public Health & Pest Control"
}

CATEGORY_BASE_SEVERITY = {
    "Drainage & Sewage": 26,
    "Streetlights & Electricity": 22,
    "Water Supply & Leakage": 24,
    "Roads & Potholes": 18,
    "Public Health & Sanitation": 20,
    "Waste Management & Garbage": 15
}

# High-urgency keyword dictionary with weighted urgency points
URGENCY_KEYWORDS = {
    # Extreme Hazard (25-35 pts)
    "open manhole": 35,
    "live wire": 35,
    "electric shock": 35,
    "sparking": 30,
    "sinkhole": 30,
    "cave in": 30,
    "fatal": 35,
    "accident": 28,
    "flooded hospital": 35,
    "flooding": 25,
    "toxic": 25,
    "contamination": 26,
    "fire hazard": 32,
    "burst pipe": 24,
    # High Hazard (15-22 pts)
    "danger": 20,
    "deep crater": 20,
    "school zone": 20,
    "dengue": 22,
    "mosquito breeding": 18,
    "sewage overflow": 22,
    "black water": 20,
    "no drinking water": 22,
    "dark street": 16,
    "pedestrian injured": 25,
    "emergency": 25,
    "stinking smell": 14,
    "overflowing garbage": 15,
    "blocking traffic": 18,
    "traffic jam": 14,
    "urgent": 15
}

TRAINING_DATA = [
    # Roads & Potholes
    ("Huge pothole on Main Street near Metro station causing vehicular damage and bike skids", "Roads & Potholes"),
    ("Crater sized hole on 4th cross road after monsoon rain, very dangerous for two-wheelers", "Roads & Potholes"),
    ("Asphalt washed away completely on highway connector, bumpy road with dust", "Roads & Potholes"),
    ("Road cave in near public school gate, risk of car wheels getting stuck", "Roads & Potholes"),
    ("Speed breaker unpainted and broken, causing sudden braking and rear end collisions", "Roads & Potholes"),
    ("Footpath paver blocks broken, senior citizens stumbling and hurting themselves", "Roads & Potholes"),
    ("Trench dug for pipeline left unfilled without barricades on 8th main", "Roads & Potholes"),
    ("Resurfacing needed for Ring Road sector 5, top bitumen layer peeled off", "Roads & Potholes"),
    ("Dangerous dip and uneven road surface near flyover landing causing accidents", "Roads & Potholes"),
    ("Divider broken and iron rods sticking out into traffic lane", "Roads & Potholes"),
    ("Mud and loose gravel scattered all over road making it slippery for motorcycles", "Roads & Potholes"),
    ("Sunken road depression causing vehicles to scrape underside", "Roads & Potholes"),

    # Waste Management & Garbage
    ("Garbage dump overflowing on corner of 7th cross, stray dogs scattering waste", "Waste Management & Garbage"),
    ("Municipal trash bin broken and overturned, foul smell spreading to residential flats", "Waste Management & Garbage"),
    ("Bio-waste and medical waste dumped openly behind community health center", "Waste Management & Garbage"),
    ("Sanitation truck has not visited ward 12 for over five days, heaps of trash accumulating", "Waste Management & Garbage"),
    ("Plastic waste and empty bottles burning by roadside causing thick choking smoke", "Waste Management & Garbage"),
    ("Public dustbin missing near weekly market, vendors throwing rotten vegetable waste on road", "Waste Management & Garbage"),
    ("Commercial restaurant dumping greasy food waste into open street corner", "Waste Management & Garbage"),
    ("Dead animal carcass lying near park entrance, flies and unbearable stench", "Waste Management & Garbage"),
    ("Illegal dumping of construction debris and debris blocking walkway", "Waste Management & Garbage"),
    ("Green waste and tree branches dumped on roadside after storm cleanup left uncollected", "Waste Management & Garbage"),
    ("Trash collection irregular in layout block B, residents forced to dump on empty plots", "Waste Management & Garbage"),
    ("Recycling bins damaged and overflowing with unsegregated domestic trash", "Waste Management & Garbage"),

    # Water Supply & Leakage
    ("Main municipal water pipe burst near water tank, thousands of liters wasting on road", "Water Supply & Leakage"),
    ("No tap water supply in sector 14 for the last 3 days, low pressure water problem", "Water Supply & Leakage"),
    ("Drinking water coming out brownish yellow with foul mud smell, contamination issue", "Water Supply & Leakage"),
    ("Water pipeline joint leaking severely underneath sidewalk, wetting foundations of buildings", "Water Supply & Leakage"),
    ("Public water tap valve broken and running continuously 24/7", "Water Supply & Leakage"),
    ("Very low water pressure during morning municipal supply hours, cannot fill upper tanks", "Water Supply & Leakage"),
    ("Pipeline punctured during fiber optic digging work, clean drinking water gushing onto road", "Water Supply & Leakage"),
    ("Contaminated water supply causing diarrhea among children in colony block 9", "Water Supply & Leakage"),
    ("Air lock in water pipeline network causing zero water flow to end houses", "Water Supply & Leakage"),
    ("Underground supply valve jammed shut, half of the colony dry without drinking water", "Water Supply & Leakage"),
    ("Water booster pump station malfunctioning in ward 6", "Water Supply & Leakage"),
    ("Worm larvae visible in municipal tap water supply", "Water Supply & Leakage"),

    # Drainage & Sewage
    ("Open manhole on busy market street without lid or warning cone, fatal falling hazard", "Drainage & Sewage"),
    ("Sewage water overflowing from choked drain into ground floor apartments", "Drainage & Sewage"),
    ("Stormwater drain clogged with plastic debris, road completely flooded in light drizzle", "Drainage & Sewage"),
    ("Underground drainage pipeline blocked, black filthy sewage bubbling up onto road", "Drainage & Sewage"),
    ("Broken concrete slab over stormwater gutter, pedestrian fell inside and broke leg", "Drainage & Sewage"),
    ("Untreated sewage flowing into open lake park, intense toxic odor in vicinity", "Drainage & Sewage"),
    ("Drainage chamber overflowing near kindergarten gate, health hazard for toddlers", "Drainage & Sewage"),
    ("Sewer line collapsed causing large sinkhole on residential street", "Drainage & Sewage"),
    ("Rainwater culvert choked with silt and trash, waterlogging entire intersection", "Drainage & Sewage"),
    ("Backflow of sewage into household bathrooms during heavy rain", "Drainage & Sewage"),
    ("Gutter cover missing on footpath opposite metro pillar 201", "Drainage & Sewage"),
    ("Stagnant black sewage water breeding mosquitoes right outside residential society", "Drainage & Sewage"),

    # Streetlights & Electricity
    ("High tension electric cable hanging low and sparking dangerously above bus stop", "Streetlights & Electricity"),
    ("All streetlights not working on 100 Feet Road for 2 weeks, pitch dark road leading to muggings", "Streetlights & Electricity"),
    ("Transformer oil leakage and buzzing sound near apartment complex, fire hazard", "Streetlights & Electricity"),
    ("Electric junction box cover broken with exposed live wires within reach of children", "Streetlights & Electricity"),
    ("Street lamp pole leaning precariously after heavy winds, might fall on parked cars", "Streetlights & Electricity"),
    ("Flickering sodium light outside hospital entrance causing eye strain and visibility issues", "Streetlights & Electricity"),
    ("Underground power cable short circuit causing frequent blackout in street 4", "Streetlights & Electricity"),
    ("Streetlights remaining on throughout bright daylight, energy wastage", "Streetlights & Electricity"),
    ("Open fuse box on streetlight pole with bare copper wires sparking during rains", "Streetlights & Electricity"),
    ("Dark stretch on outer ring road service lane due to non-functional LED lamps", "Streetlights & Electricity"),
    ("Electricity meter pole rusted at base and wobbling", "Streetlights & Electricity"),
    ("Streetlight timer broken, lights do not turn on until late midnight", "Streetlights & Electricity"),

    # Public Health & Sanitation
    ("Stagnant water pool on vacant plot breeding dengue and chikungunya mosquitoes", "Public Health & Sanitation"),
    ("Stray dog menace near school campus, multiple cases of aggressive dog bites", "Public Health & Sanitation"),
    ("Public toilet facility in bus terminal extremely filthy, choked, and unusable", "Public Health & Sanitation"),
    ("Open defecation along railway track perimeter due to lack of public sanitation booths", "Public Health & Sanitation"),
    ("Fogging for mosquito control not conducted in ward 8 despite dengue outbreak", "Public Health & Sanitation"),
    ("Illegal butcher shop disposing animal blood and entrails into public open space", "Public Health & Sanitation"),
    ("Pest infestation of rats and cockroaches originating from uncleaned municipal alleyway", "Public Health & Sanitation"),
    ("No sanitizer or water supply in municipal dispensary public restrooms", "Public Health & Sanitation"),
    ("Open dumping of toxic chemical effluents near residential borewell area", "Public Health & Sanitation"),
    ("Swarm of stray cattle blocking crossroads and leaving dung all over pedestrian paths", "Public Health & Sanitation"),
    ("Unhygienic street food stall washing utensils in stagnant drain water", "Public Health & Sanitation"),
    ("Community park pond turned green with algae and dead fish floating", "Public Health & Sanitation")
]

class MLComplaintService:
    def __init__(self, model_dir: str = "backend/ml_models"):
        self.model_dir = model_dir
        os.makedirs(self.model_dir, exist_ok=True)
        self.vectorizer_path = os.path.join(self.model_dir, "tfidf_vectorizer.joblib")
        self.classifier_path = os.path.join(self.model_dir, "civic_classifier.joblib")
        
        self.vectorizer: TfidfVectorizer = None
        self.classifier: LogisticRegression = None
        
        self._load_or_train_model()

    def _clean_text(self, text: str) -> str:
        """Normalize and clean text input."""
        if not text:
            return ""
        text = text.lower()
        text = re.sub(r"[^\w\s]", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def _load_or_train_model(self):
        """Loads trained model or trains on embedded realistic dataset."""
        if os.path.exists(self.vectorizer_path) and os.path.exists(self.classifier_path):
            try:
                self.vectorizer = joblib.load(self.vectorizer_path)
                self.classifier = joblib.load(self.classifier_path)
                print("Loaded existing CivicPulse ML model and TF-IDF vectorizer successfully.")
                return
            except Exception as e:
                print(f"Error loading saved model: {e}. Retraining...")

        self.train_model(TRAINING_DATA)

    def train_model(self, data: List[Tuple[str, str]]):
        """Trains TF-IDF + LogisticRegression on dataset and persists artifacts."""
        texts = [self._clean_text(item[0]) for item in data]
        labels = [item[1] for item in data]

        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=2500,
            sublinear_tf=True,
            stop_words="english"
        )
        X = self.vectorizer.fit_transform(texts)

        self.classifier = LogisticRegression(
            C=1.2,
            max_iter=1000,
            random_state=42
        )
        self.classifier.fit(X, labels)

        # Save models
        joblib.dump(self.vectorizer, self.vectorizer_path)
        joblib.dump(self.classifier, self.classifier_path)
        print("Trained and saved new CivicPulse ML model successfully.")

    def predict_category(self, title: str, description: str) -> Dict[str, Any]:
        """Predicts complaint category and top probabilities."""
        full_text = f"{title} {description}"
        cleaned = self._clean_text(full_text)
        
        if not self.vectorizer or not self.classifier:
            self._load_or_train_model()

        vec = self.vectorizer.transform([cleaned])
        predicted_cat = str(self.classifier.predict(vec)[0])
        
        probabilities = self.classifier.predict_proba(vec)[0]
        classes = self.classifier.classes_
        
        prob_dict = {str(classes[i]): round(float(probabilities[i]), 3) for i in range(len(classes))}
        confidence = float(prob_dict.get(predicted_cat, 0.85))

        department = CATEGORY_DEPARTMENT_MAP.get(predicted_cat, "General Municipal Administration")
        
        # Calculate transparent priority
        priority_info = self.calculate_priority(
            title=title,
            description=description,
            category=predicted_cat,
            duplicate_count=1,
            days_pending=0,
            upvotes=1
        )

        return {
            "predicted_category": predicted_cat,
            "department": department,
            "confidence": confidence,
            "top_probabilities": prob_dict,
            "suggested_priority": priority_info["priority_level"],
            "priority_score": priority_info["priority_score"],
            "priority_breakdown": priority_info["breakdown"]
        }

    def calculate_priority(
        self,
        title: str,
        description: str,
        category: str,
        duplicate_count: int = 1,
        days_pending: float = 0,
        upvotes: int = 1
    ) -> Dict[str, Any]:
        """
        Calculates transparent priority score (0-100) with detailed component explanations.
        Formula:
          Total = Keyword Urgency (0-35) + Category Baseline (15-26) + Volume/Duplicates (0-20) + Aging Factor (0-15) + Community Upvotes (0-10)
        """
        combined_text = (f"{title} {description}").lower()
        reasons = []

        # 1. Urgency Keywords (Max 35)
        highest_keyword_score = 0
        matched_keywords = []
        for kw, score in URGENCY_KEYWORDS.items():
            if kw in combined_text:
                matched_keywords.append(kw)
                if score > highest_keyword_score:
                    highest_keyword_score = score
        
        # Additional small bonus if multiple distinct urgent keywords are present
        if len(matched_keywords) > 1:
            keyword_score = min(35, highest_keyword_score + (len(matched_keywords) - 1) * 3)
        else:
            keyword_score = highest_keyword_score

        if matched_keywords:
            reasons.append(f"Urgency keywords detected: '{', '.join(matched_keywords[:3])}' (+{keyword_score} pts)")
        else:
            reasons.append("Standard civic issue, no extreme safety keywords detected (+0 pts)")

        # 2. Category Baseline Severity (15 - 26)
        cat_score = CATEGORY_BASE_SEVERITY.get(category, 18)
        reasons.append(f"Category '{category}' baseline impact (+{cat_score} pts)")

        # 3. Volume & Duplicate reports multiplier (Max 20)
        # Issues reported multiple times by different citizens represent recurring hotspots
        dup_factor = min(20, (max(1, duplicate_count) - 1) * 5)
        if dup_factor > 0:
            reasons.append(f"Recurring issue flagged by {duplicate_count} reports (+{dup_factor} pts)")
        else:
            reasons.append("Initial unique report (+0 pts)")

        # 4. Aging / SLA Escalation (Max 15)
        age_score = 0
        if days_pending > 10:
            age_score = 15
            reasons.append(f"Critical SLA breach: pending for {days_pending:.1f} days (+15 pts)")
        elif days_pending > 5:
            age_score = 10
            reasons.append(f"Moderate SLA delay: pending for {days_pending:.1f} days (+10 pts)")
        elif days_pending > 2:
            age_score = 5
            reasons.append(f"Pending for {days_pending:.1f} days (+5 pts)")
        else:
            reasons.append("Newly submitted complaint (< 48 hrs) (+0 pts)")

        # 5. Community Upvotes Factor (Max 10)
        upvote_score = min(10, (max(1, upvotes) - 1) * 2)
        if upvote_score > 0:
            reasons.append(f"Endorsed by {upvotes} verified citizens (+{upvote_score} pts)")

        raw_total = keyword_score + cat_score + dup_factor + age_score + upvote_score
        total_score = min(100.0, max(10.0, float(raw_total)))

        # Priority Level Mapping
        if total_score >= 75:
            level = "CRITICAL"
        elif total_score >= 55:
            level = "HIGH"
        elif total_score >= 35:
            level = "MEDIUM"
        else:
            level = "LOW"

        breakdown = {
            "keyword_urgency": keyword_score,
            "category_baseline": cat_score,
            "duplicate_volume": dup_factor,
            "sla_aging": age_score,
            "citizen_upvotes": upvote_score,
            "total_score": round(total_score, 1),
            "priority_level": level,
            "rationale": reasons
        }

        return {
            "priority_score": round(total_score, 1),
            "priority_level": level,
            "breakdown": breakdown
        }

    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculates distance in kilometers between two geo coordinates."""
        R = 6371.0 # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 2)

    def find_duplicates(
        self,
        new_title: str,
        new_description: str,
        existing_complaints: List[Dict[str, Any]],
        new_lat: float = None,
        new_lon: float = None,
        threshold: float = 0.38
    ) -> List[Dict[str, Any]]:
        """
        Computes cosine similarity between new complaint and existing active complaints.
        Incorporates geographical proximity when coordinates are provided.
        """
        if not existing_complaints:
            return []

        target_text = self._clean_text(f"{new_title} {new_description}")
        corpus = [self._clean_text(f"{c.get('title', '')} {c.get('description', '')}") for c in existing_complaints]

        if not self.vectorizer:
            self._load_or_train_model()

        all_texts = [target_text] + corpus
        tfidf_matrix = self.vectorizer.transform(all_texts)
        target_vec = tfidf_matrix[0:1]
        existing_matrix = tfidf_matrix[1:]

        similarities = cosine_similarity(target_vec, existing_matrix)[0]

        matches = []
        for idx, sim in enumerate(similarities):
            comp = existing_complaints[idx]
            sim_score = float(sim)
            
            # Geo distance calculation if available
            dist_km = None
            if new_lat is not None and new_lon is not None and comp.get("latitude") and comp.get("longitude"):
                try:
                    dist_km = self._haversine_distance(new_lat, new_lon, float(comp["latitude"]), float(comp["longitude"]))
                    # Proximity boost: if complaints are within 0.4 km (400 meters) and text is moderately similar
                    if dist_km <= 0.4 and sim_score >= 0.28:
                        sim_score = min(1.0, sim_score + 0.15)
                except Exception:
                    pass

            if sim_score >= threshold:
                matches.append({
                    "complaint_id": int(comp["id"]),
                    "tracking_number": str(comp.get("tracking_number", "")),
                    "title": str(comp["title"]),
                    "category": str(comp.get("predicted_category", "")),
                    "status": str(comp.get("status", "")),
                    "similarity_score": round(float(sim_score), 3),
                    "similarity_percent": int(round(sim_score * 100)),
                    "address": str(comp.get("address", "")),
                    "distance_km": float(dist_km) if dist_km is not None else None,
                    "created_at": str(comp.get("created_at", ""))
                })

        # Sort matches by highest similarity first
        matches.sort(key=lambda x: x["similarity_score"], reverse=True)
        return matches

# Singleton instance
ml_service = MLComplaintService()
