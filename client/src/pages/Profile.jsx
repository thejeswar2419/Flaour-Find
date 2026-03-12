import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import RestaurantDetailModal from "../components/RestaurantDetailModal";

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("liked");
    const [interactions, setInteractions] = useState([]);
    const [loadingInteractions, setLoadingInteractions] = useState(true);
    const [detailModal, setDetailModal] = useState(null);

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const toast = useToast();

    const fetchProfile = () => {
        API.get("/users/me")
            .then(res => setProfile(res.data))
            .catch(() => navigate("/login"))
            .finally(() => setLoading(false));
    };

    const fetchInteractions = () => {
        API.get("/interactions/me")
            .then(res => setInteractions(res.data))
            .catch(() => { })
            .finally(() => setLoadingInteractions(false));
    };

    useEffect(() => {
        if (!user) { navigate("/login"); return; }
        fetchProfile();
        fetchInteractions();
    }, [user]);

    // Unlike (unchanged)
    const handleUnlike = async (id, name) => {
        try {
            await API.delete(`/users/like/${id}`);
            setProfile(p => ({ ...p, likedRestaurants: p.likedRestaurants.filter(r => r._id !== id) }));
            toast(`Removed ${name} from liked`, "info");
        } catch {
            toast("Failed to unlike", "error");
        }
    };

    // Unsave (unchanged)
    const handleUnsave = async (id, name) => {
        try {
            await API.delete(`/users/save/${id}`);
            setProfile(p => ({ ...p, savedRestaurants: p.savedRestaurants.filter(r => r._id !== id) }));
            toast(`Removed ${name} from saved`, "info");
        } catch {
            toast("Failed to unsave", "error");
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="profile-header">
                    <div className="profile-avatar skeleton" style={{ background: undefined }} />
                    <div style={{ flex: 1 }}>
                        <div className="skeleton skeleton-text" style={{ width: "40%", height: 24, marginBottom: 8 }} />
                        <div className="skeleton skeleton-text short" style={{ height: 14 }} />
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    // Ratings from interactions
    const myRatings = interactions.filter(i => i.type === "rate");
    const myReviews = interactions.filter(i => i.type === "review");

    // Build a map of restaurantId -> restaurant details from liked/saved
    const restaurantMap = {};
    [...(profile.likedRestaurants || []), ...(profile.savedRestaurants || [])].forEach(r => {
        if (r && r._id) restaurantMap[r._id] = r;
    });

    const restaurantList = tab === "liked"
        ? profile.likedRestaurants
        : tab === "saved"
            ? profile.savedRestaurants
            : null; // ratings/reviews handled separately

    return (
        <div className="page">
            {/* ── PROFILE HEADER (unchanged) ── */}
            <div className="profile-header">
                <div className="profile-avatar">
                    {profile.name?.[0]?.toUpperCase()}
                </div>
                <div className="profile-info">
                    <h1>{profile.name}</h1>
                    <p>{profile.email}</p>
                    <div className="profile-prefs">
                        {profile.preferredCuisine && (
                            <span className="badge badge-cuisine">🍽 {profile.preferredCuisine}</span>
                        )}
                        {profile.budget && (
                            <span className="badge badge-rating">💰 ₹{profile.budget} budget</span>
                        )}
                        {profile.vegOnly && (
                            <span className="badge badge-veg">🥦 Veg Only</span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── TABS (liked + saved unchanged, NEW: ratings + reviews) ── */}
            <div className="profile-tabs">
                <button
                    className={`tab-btn ${tab === "liked" ? "active" : ""}`}
                    onClick={() => setTab("liked")}
                >
                    ❤️ Liked ({profile.likedRestaurants?.length || 0})
                </button>
                <button
                    className={`tab-btn ${tab === "saved" ? "active" : ""}`}
                    onClick={() => setTab("saved")}
                >
                    💾 Saved ({profile.savedRestaurants?.length || 0})
                </button>
                <button
                    className={`tab-btn ${tab === "ratings" ? "active" : ""}`}
                    onClick={() => setTab("ratings")}
                >
                    ⭐ Ratings ({myRatings.length})
                </button>
                <button
                    className={`tab-btn ${tab === "reviews" ? "active" : ""}`}
                    onClick={() => setTab("reviews")}
                >
                    💬 Reviews ({myReviews.length})
                </button>
            </div>

            {/* ── LIKED / SAVED LIST (unchanged) ── */}
            {(tab === "liked" || tab === "saved") && (
                !restaurantList || restaurantList.length === 0 ? (
                    <div className="empty-state" style={{ padding: "48px 24px" }}>
                        <div className="empty-icon">{tab === "liked" ? "🤍" : "🔖"}</div>
                        <h3>No {tab} restaurants yet</h3>
                        <p>Browse restaurants and {tab === "liked" ? "like" : "save"} your favourites to see them here</p>
                        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/")}>
                            Browse Restaurants
                        </button>
                    </div>
                ) : (
                    <div className="section">
                        {restaurantList.map((r, i) => (
                            <div
                                className="restaurant-list-item"
                                key={r._id || i}
                                onClick={() => setDetailModal(r)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="restaurant-list-item-info">
                                    <strong>{r.name}</strong>
                                    <span>
                                        {r.cuisine} · ₹{r.averageCost} avg
                                        {r.special ? ` · ✨ ${r.special}` : ""}
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                    {r.rating > 0 && (
                                        <span className="badge badge-rating">★ {r.rating?.toFixed(1)}</span>
                                    )}
                                    {r.vegOnly !== undefined && (
                                        <span className={`badge ${r.vegOnly ? "badge-veg" : "badge-nonveg"}`}>
                                            {r.vegOnly ? "Veg" : "Non-Veg"}
                                        </span>
                                    )}
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={(e) => { e.stopPropagation(); tab === "liked" ? handleUnlike(r._id, r.name) : handleUnsave(r._id, r.name); }}
                                        style={{ color: "var(--error)" }}
                                    >
                                        {tab === "liked" ? "Unlike" : "Unsave"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* ── NEW: RATINGS TAB ── */}
            {tab === "ratings" && (
                loadingInteractions ? (
                    <div className="section">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="restaurant-list-item">
                                <div className="skeleton skeleton-text" style={{ width: "50%", height: 14 }} />
                                <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 8 }} />
                            </div>
                        ))}
                    </div>
                ) : myRatings.length === 0 ? (
                    <div className="empty-state" style={{ padding: "48px 24px" }}>
                        <div className="empty-icon">⭐</div>
                        <h3>No ratings yet</h3>
                        <p>Rate restaurants to help improve your recommendations</p>
                        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/")}>
                            Browse Restaurants
                        </button>
                    </div>
                ) : (
                    <div className="section">
                        {myRatings.map((item, i) => {
                            const restaurant = restaurantMap[item.restaurantId];
                            return (
                                <div
                                    key={item._id || i}
                                    className="restaurant-list-item"
                                    onClick={() => restaurant && setDetailModal(restaurant)}
                                    style={{ cursor: restaurant ? "pointer" : "default" }}
                                >
                                    <div className="restaurant-list-item-info">
                                        <strong>{restaurant?.name || `Restaurant (${item.restaurantId.slice(-6)})`}</strong>
                                        <span>
                                            {restaurant?.cuisine && `${restaurant.cuisine} · `}
                                            Rated on {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <span key={s} style={{ color: s <= item.rating ? "#f59e0b" : "#d1d5db", fontSize: 18 }}>★</span>
                                        ))}
                                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginLeft: 4 }}>
                                            {item.rating}/5
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            )}

            {/* ── NEW: REVIEWS TAB ── */}
            {tab === "reviews" && (
                loadingInteractions ? (
                    <div className="section">
                        {[1, 2].map(i => (
                            <div key={i} style={{ padding: 20, borderBottom: "1px solid var(--border)" }}>
                                <div className="skeleton skeleton-text" style={{ width: "40%", height: 14, marginBottom: 8 }} />
                                <div className="skeleton skeleton-text" style={{ width: "80%", height: 12 }} />
                            </div>
                        ))}
                    </div>
                ) : myReviews.length === 0 ? (
                    <div className="empty-state" style={{ padding: "48px 24px" }}>
                        <div className="empty-icon">💬</div>
                        <h3>No reviews yet</h3>
                        <p>Share your experience by writing reviews from the restaurant cards</p>
                        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/")}>
                            Browse Restaurants
                        </button>
                    </div>
                ) : (
                    <div className="section">
                        {myReviews.map((item, i) => {
                            const restaurant = restaurantMap[item.restaurantId];
                            return (
                                <div
                                    key={item._id || i}
                                    style={{
                                        padding: "20px 0",
                                        borderBottom: "1px solid var(--border)",
                                        cursor: restaurant ? "pointer" : "default",
                                    }}
                                    onClick={() => restaurant && setDetailModal(restaurant)}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                        <div>
                                            <strong style={{ fontSize: 15 }}>
                                                {restaurant?.name || `Restaurant (${item.restaurantId.slice(-6)})`}
                                            </strong>
                                            {restaurant?.cuisine && (
                                                <span className="badge badge-cuisine" style={{ marginLeft: 8 }}>{restaurant.cuisine}</span>
                                            )}
                                        </div>
                                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                                            {item.rating > 0 && (
                                                <div style={{ marginBottom: 2 }}>
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <span key={s} style={{ color: s <= item.rating ? "#f59e0b" : "#d1d5db", fontSize: 14 }}>★</span>
                                                    ))}
                                                </div>
                                            )}
                                            <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                                                {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
                                        "{item.review}"
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )
            )}

            {/* ── RESTAURANT DETAIL MODAL ── */}
            {detailModal && (
                <RestaurantDetailModal
                    restaurant={detailModal}
                    onClose={() => setDetailModal(null)}
                />
            )}
        </div>
    );
}