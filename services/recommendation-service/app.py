import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "model"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests

from model.preprocessing import build_restaurant_features, build_user_profile
from model.train import train, load_model, rank_restaurants

app = FastAPI(title="FlavourFind Recommendation Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

RESTAURANT_SERVICE  = os.getenv("RESTAURANT_SERVICE_URL",  "http://restaurant-service:5002")
INTERACTION_SERVICE = os.getenv("INTERACTION_SERVICE_URL", "http://interaction-service:5003")

model = {}

@app.on_event("startup")
async def startup():
    global model
    model = load_model()
    if model:
        print(f"[Startup] Model loaded — {len(model.get('restaurant_ids', []))} restaurants.")
    else:
        print("[Startup] No saved model — will train on first request.")

@app.post("/train")
def train_model():
    global model
    try:
        res = requests.get(f"{RESTAURANT_SERVICE}/restaurants", timeout=10)
        restaurants = res.json()
        if not restaurants:
            return {"message": "No restaurants to train on"}
        model = train(restaurants)
        return {"message": f"Model trained on {len(restaurants)} restaurants"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/recommend")
def recommend(data: dict):
    """
    Body: { userId, user, restaurants, interactions }
    - userId: string (used to auto-fetch interactions if not provided)
    - user: { preferredCuisine, budget, vegOnly }
    - restaurants: list of restaurant objects
    - interactions: { liked: [], saved: [], rated: [] }  (optional, auto-fetched if empty)
    """
    global model

    restaurants  = data.get("restaurants", [])
    user         = data.get("user", {})
    interactions = data.get("interactions", {})
    user_id      = data.get("userId")

    if not restaurants:
        return {"ranked": [], "meta": {"totalRanked": 0}}

    # Auto-fetch interactions from interaction service if not supplied
    if user_id and not any([interactions.get("liked"), interactions.get("saved"), interactions.get("rated")]):
        try:
            r = requests.get(f"{INTERACTION_SERVICE}/interactions/summary/{user_id}", timeout=5)
            if r.status_code == 200:
                interactions = r.json()
        except Exception as e:
            print(f"[Recommend] Could not fetch interactions: {e}")

    # Train/retrain if needed
    if not model or len(model.get("restaurant_ids", [])) < len(restaurants):
        print("[Recommend] Training model...")
        model = train(restaurants)

    # Build user vector
    try:
        user_vec = build_user_profile(user, interactions, restaurants)
    except Exception as e:
        print(f"[Recommend] Profile build error: {e}")
        for r in restaurants:
            r["score"] = round(r.get("rating", 0) * 0.6 + 1 / max(r.get("averageCost", 1), 1), 4)
        return {"ranked": sorted(restaurants, key=lambda x: x["score"], reverse=True)}

    veg_only = user.get("vegOnly", False)
    ranked = rank_restaurants(user_vec, restaurants, model, interactions, veg_only)

    return {
        "ranked": ranked,
        "meta": {
            "totalRanked": len(ranked),
            "hasInteractionHistory": bool(
                interactions.get("liked") or interactions.get("saved") or interactions.get("rated")
            ),
            "modelTrained": bool(model)
        }
    }

@app.get("/")
def health():
    return {
        "message": "Recommendation Service running",
        "modelLoaded": bool(model),
        "restaurantsInModel": len(model.get("restaurant_ids", [])) if model else 0
    }