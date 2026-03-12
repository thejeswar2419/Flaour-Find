import numpy as np
import pickle
import os
from sklearn.metrics.pairwise import cosine_similarity
from preprocessing import build_restaurant_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

def train(restaurants: list) -> dict:
    """Build and save the restaurant feature matrix."""
    if not restaurants:
        return {}

    ids, vecs = [], []
    for r in restaurants:
        rid = str(r.get("_id", ""))
        if rid:
            ids.append(rid)
            vecs.append(build_restaurant_features(r, restaurants))

    model = {
        "restaurant_ids": ids,
        "feature_matrix": np.array(vecs, dtype=np.float32),
    }
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    print(f"[Train] Model saved — {len(ids)} restaurants.")
    return model

def load_model() -> dict:
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    return {}

def rank_restaurants(user_vec: np.ndarray, restaurants: list, model: dict,
                     interactions: dict, veg_only: bool = False) -> list:
    """Rank restaurants by cosine similarity + interaction boosts."""
    if not model or "feature_matrix" not in model:
        # Fallback to simple score
        for r in restaurants:
            r["score"] = round(r.get("rating", 0) * 0.6 + 1 / max(r.get("averageCost", 1), 1), 4)
        return sorted(restaurants, key=lambda x: x["score"], reverse=True)

    rid_to_restaurant = {str(r["_id"]): r for r in restaurants}
    sims = cosine_similarity(user_vec.reshape(1, -1), model["feature_matrix"])[0]

    liked_ids = set(interactions.get("liked", []))
    saved_ids = set(interactions.get("saved", []))
    rated_map = {e["restaurantId"]: e["rating"] for e in interactions.get("rated", [])}

    results = []
    for i, rid in enumerate(model["restaurant_ids"]):
        r = rid_to_restaurant.get(rid)
        if not r:
            continue
        if veg_only and not r.get("vegOnly"):
            continue

        score = float(sims[i])
        if rid in liked_ids: score *= 1.3
        if rid in saved_ids: score *= 1.2
        if rid in rated_map: score *= (0.8 + rated_map[rid] * 0.1)

        r["score"] = round(score, 4)
        results.append(r)

    return sorted(results, key=lambda x: x["score"], reverse=True)