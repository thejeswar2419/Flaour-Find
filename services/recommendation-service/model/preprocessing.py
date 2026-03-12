import numpy as np

CUISINE_LIST = [
    "South Indian", "North Indian", "Continental",
    "Chinese", "Italian", "Mexican", "Thai", "Street Food"
]

def encode_cuisine(cuisine: str) -> list:
    return [1 if c == cuisine else 0 for c in CUISINE_LIST]

def normalize(value: float, min_val: float, max_val: float) -> float:
    if max_val == min_val:
        return 0.5
    return (value - min_val) / (max_val - min_val)

def build_restaurant_features(restaurant: dict, all_restaurants: list) -> np.ndarray:
    """
    Feature vector: [rating_norm, cost_norm, is_veg, *cuisine_onehot]
    """
    costs   = [r.get("averageCost", 0) for r in all_restaurants]
    ratings = [r.get("rating", 0) for r in all_restaurants]

    rating_norm = normalize(restaurant.get("rating", 0), min(ratings), max(ratings))
    cost_norm   = normalize(restaurant.get("averageCost", 0), min(costs), max(costs))
    is_veg      = 1.0 if restaurant.get("vegOnly") else 0.0
    cuisine_enc = encode_cuisine(restaurant.get("cuisine", ""))

    return np.array([rating_norm, cost_norm, is_veg] + cuisine_enc, dtype=np.float32)

def build_user_profile(user: dict, interactions: dict, all_restaurants: list) -> np.ndarray:
    """
    User preference vector built from:
    - Profile (cuisine, budget, vegOnly)
    - Interaction history (liked=1.0, saved=0.8, rated=rating/5)
    Blends 60% history + 40% profile when history exists.
    """
    restaurant_map = {str(r["_id"]): r for r in all_restaurants}
    costs   = [r.get("averageCost", 0) for r in all_restaurants]

    weighted_vecs = []
    weights = []

    for rid in interactions.get("liked", []):
        if rid in restaurant_map:
            vec = build_restaurant_features(restaurant_map[rid], all_restaurants)
            weighted_vecs.append(vec * 1.0)
            weights.append(1.0)

    for rid in interactions.get("saved", []):
        if rid in restaurant_map:
            vec = build_restaurant_features(restaurant_map[rid], all_restaurants)
            weighted_vecs.append(vec * 0.8)
            weights.append(0.8)

    for entry in interactions.get("rated", []):
        rid = entry.get("restaurantId")
        rating = entry.get("rating", 3)
        if rid in restaurant_map:
            w = rating / 5.0
            vec = build_restaurant_features(restaurant_map[rid], all_restaurants)
            weighted_vecs.append(vec * w)
            weights.append(w)

    history_vec = np.average(weighted_vecs, axis=0, weights=weights) if weighted_vecs else None

    budget = user.get("budget", None)
    cost_norm = normalize(budget, min(costs), max(costs)) if budget and costs else 0.5
    is_veg = 1.0 if user.get("vegOnly") else 0.0
    cuisine_enc = encode_cuisine(user.get("preferredCuisine", ""))
    profile_vec = np.array([0.5, 1.0 - cost_norm, is_veg] + cuisine_enc, dtype=np.float32)

    if history_vec is not None:
        return 0.6 * np.array(history_vec) + 0.4 * profile_vec
    return profile_vec