import { useEffect, useState, useCallback, useContext } from "react";
import API from "../api";
import { useToast } from "../context/ToastContext";
import { AuthContext } from "../context/AuthContext";
import RestaurantDetailModal from "../components/RestaurantDetailModal";

const PAGE_SIZE = 9;
const CUISINES = ["South Indian", "North Indian", "Continental", "Chinese", "Italian", "Mexican", "Thai", "Street Food"];

// ── Skeleton (unchanged) ──
function SkeletonCard() {
    return (
        <div className="restaurant-card" style={{ pointerEvents: "none" }}>
            <div className="card-color-bar" style={{ opacity: 0.3 }} />
            <div className="card-body" style={{ gap: 10 }}>
                <div className="skeleton skeleton-text" style={{ width: "70%", height: 18 }} />
                <div className="skeleton skeleton-text short" />
                <div className="skeleton skeleton-text" style={{ width: "40%" }} />
                <div style={{ marginTop: "auto", paddingTop: 14 }}>
                    <div className="skeleton" style={{ height: 34, borderRadius: 8 }} />
                </div>
            </div>
        </div>
    );
}

// ── Static star display (unchanged) ──
function StarRating({ rating }) {
    const stars = Math.round(rating);
    return (
        <span title={`${rating} / 5`}>
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} style={{ color: i <= stars ? "#f59e0b" : "#d1d5db", fontSize: 13 }}>★</span>
            ))}
        </span>
    );
}

// ── Pagination (unchanged) ──
function Pagination({ page, totalPages, onPage }) {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== "...") {
            pages.push("...");
        }
    }
    return (
        <div className="pagination">
            <button className="pagination-btn" disabled={page === 1} onClick={() => onPage(page - 1)}>←</button>
            {pages.map((p, i) =>
                p === "..." ? (
                    <span key={i} className="pagination-ellipsis">…</span>
                ) : (
                    <button key={p} className={`pagination-btn ${p === page ? "active" : ""}`} onClick={() => onPage(p)}>{p}</button>
                )
            )}
            <button className="pagination-btn" disabled={page === totalPages} onClick={() => onPage(page + 1)}>→</button>
        </div>
    );
}

// ── Interactive star rating (unchanged) ──
function InteractiveStars({ restaurantId, onRate }) {
    const [hover, setHover] = useState(0);
    const [selected, setSelected] = useState(0);
    return (
        <div style={{ display: "flex", gap: 2 }}>
            {[1, 2, 3, 4, 5].map(star => (
                <span key={star}
                    style={{ fontSize: 18, cursor: "pointer", color: star <= (hover || selected) ? "#f59e0b" : "#d1d5db", transition: "color 0.1s" }}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => { setSelected(star); onRate(restaurantId, star); }}
                >★</span>
            ))}
        </div>
    );
}

// ── Review modal (unchanged) ──
function ReviewModal({ restaurant, onClose, onSubmit }) {
    const [review, setReview] = useState("");
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!review.trim()) return;
        setLoading(true);
        await onSubmit(restaurant._id, rating, review);
        setLoading(false);
        onClose();
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
            <div style={{ background: "white", borderRadius: 16, padding: 32, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: 6 }}>
                    Review {restaurant.name}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20 }}>
                    Share your experience to help others discover great food
                </p>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
                        Your Rating
                    </label>
                    <div style={{ display: "flex", gap: 4 }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <span key={star}
                                style={{ fontSize: 28, cursor: "pointer", color: star <= (hover || rating) ? "#f59e0b" : "#d1d5db" }}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(star)}
                            >★</span>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label>Your Review</label>
                    <textarea value={review} onChange={e => setReview(e.target.value)}
                        placeholder="What did you love about this place?" rows={4}
                        style={{ width: "100%", resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading || !review.trim()}>
                        {loading ? "Submitting…" : "Submit Review"}
                    </button>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const toast = useToast();
    const { user } = useContext(AuthContext);

    const [allRestaurants, setAllRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const [likedIds, setLikedIds] = useState(new Set());
    const [savedIds, setSavedIds] = useState(new Set());

    const [isRecommended, setIsRecommended] = useState(false);
    const [loadingRecommend, setLoadingRecommend] = useState(false);
    const [reviewModal, setReviewModal] = useState(null);
    const [detailModal, setDetailModal] = useState(null); // NEW: restaurant detail modal

    const [filters, setFilters] = useState({ cuisine: "", maxCost: "", vegOnly: false });
    const [activeFilters, setActiveFilters] = useState(null);

    // Load liked/saved on mount (unchanged)
    useEffect(() => {
        API.get("/users/me").then(res => {
            setLikedIds(new Set(res.data.likedRestaurants?.map(r => r._id || r) || []));
            setSavedIds(new Set(res.data.savedRestaurants?.map(r => r._id || r) || []));
        }).catch(() => { });
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setIsRecommended(false);
        try {
            const res = await API.get("/restaurants");
            setAllRestaurants(res.data);
        } catch {
            toast("Failed to load restaurants. Is the server running?", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    };

    // Apply filters (unchanged)
    const handleApplyFilter = async () => {
        setLoading(true);
        setPage(1);
        setIsRecommended(false);
        try {
            const body = {
                cuisine: filters.cuisine || undefined,
                vegOnly: filters.vegOnly || undefined,
                maxCost: filters.maxCost ? Number(filters.maxCost) : undefined,
            };
            const res = await API.post("/restaurants/filter", body);
            setAllRestaurants(res.data);
            setActiveFilters({ ...filters });
            toast(`Found ${res.data.length} restaurant${res.data.length !== 1 ? "s" : ""}`, "success");
        } catch {
            toast("Filter failed. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFilters({ cuisine: "", maxCost: "", vegOnly: false });
        setActiveFilters(null);
        setPage(1);
        fetchAll();
    };

    // Nearby (unchanged)
    const handleNearby = () => {
        if (!navigator.geolocation) { toast("Geolocation not supported by your browser", "error"); return; }
        toast("Finding restaurants near you…", "info");
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                setLoading(true);
                setPage(1);
                setIsRecommended(false);
                try {
                    const res = await API.post("/restaurants/nearby", {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        maxDistance: 5000,
                    });
                    setAllRestaurants(res.data);
                    toast(`Found ${res.data.length} nearby restaurant${res.data.length !== 1 ? "s" : ""}`, "success");
                } catch {
                    toast("Nearby search failed", "error");
                } finally {
                    setLoading(false);
                }
            },
            () => toast("Location permission denied", "error")
        );
    };

    // Like/unlike (unchanged)
    const handleLike = async (e, id, name) => {
        e.stopPropagation(); // prevent card click opening modal
        const isLiked = likedIds.has(id);
        try {
            if (isLiked) {
                await API.delete(`/users/like/${id}`);
                setLikedIds(s => { const n = new Set(s); n.delete(id); return n; });
                toast(`Unliked ${name}`, "info");
            } else {
                await API.post(`/users/like/${id}`);
                setLikedIds(s => new Set([...s, id]));
                toast(`Liked ${name}! ❤️`, "success");
            }
        } catch {
            toast("Please login to like restaurants", "error");
        }
    };

    // Save/unsave (unchanged)
    const handleSave = async (e, id, name) => {
        e.stopPropagation(); // prevent card click opening modal
        const isSaved = savedIds.has(id);
        try {
            if (isSaved) {
                await API.delete(`/users/save/${id}`);
                setSavedIds(s => { const n = new Set(s); n.delete(id); return n; });
                toast(`Removed ${name} from saved`, "info");
            } else {
                await API.post(`/users/save/${id}`);
                setSavedIds(s => new Set([...s, id]));
                toast(`Saved ${name} to your profile 💾`, "success");
            }
        } catch {
            toast("Please login to save restaurants", "error");
        }
    };

    // Recommendations (unchanged)
    const handleRecommend = async () => {
        if (!user) { toast("Please login to get personalised recommendations", "error"); return; }
        setLoadingRecommend(true);
        try {
            const res = await API.post("/recommend", {});
            setAllRestaurants(res.data.ranked);
            setIsRecommended(true);
            setPage(1);
            const meta = res.data.meta;
            toast(
                meta?.hasInteractionHistory
                    ? "Personalised recommendations ready! 🎯"
                    : "Recommendations based on your profile 👤",
                "success"
            );
        } catch {
            toast("Recommendations unavailable right now", "error");
        } finally {
            setLoadingRecommend(false);
        }
    };

    // Rate (unchanged)
    const handleRate = async (e, restaurantId, rating) => {
        e.stopPropagation();
        try {
            await API.post("/interactions", { restaurantId, type: "rate", rating });
            toast(`Rated ${rating} star${rating !== 1 ? "s" : ""} ⭐`, "success");
        } catch {
            toast("Please login to rate restaurants", "error");
        }
    };

    // Review submit (unchanged)
    const handleReviewSubmit = async (restaurantId, rating, review) => {
        try {
            await API.post("/interactions", { restaurantId, type: "review", rating, review });
            toast("Review submitted! 🎉", "success");
        } catch {
            toast("Please login to write reviews", "error");
        }
    };

    const totalPages = Math.ceil(allRestaurants.length / PAGE_SIZE);
    const paginated = allRestaurants.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const hasActiveFilters = activeFilters && (activeFilters.cuisine || activeFilters.maxCost || activeFilters.vegOnly);

    return (
        <div className="page">
            <div className="page-header">
                <h1>Discover Restaurants</h1>
                <p>Find your next favourite meal nearby</p>
            </div>

            {/* ── FILTER CARD (unchanged) ── */}
            <div className="filter-card">
                <h2>🔍 Filter & Search</h2>
                <div className="filter-row">
                    <div className="filter-group">
                        <label>Cuisine</label>
                        <select name="cuisine" value={filters.cuisine} onChange={handleFilterChange}>
                            <option value="">All Cuisines</option>
                            {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Max Cost (₹)</label>
                        <input type="number" name="maxCost" placeholder="e.g. 500" value={filters.maxCost} onChange={handleFilterChange} min="0" />
                    </div>
                    <div className="filter-group" style={{ justifyContent: "flex-end" }}>
                        <label>Diet</label>
                        <div className="toggle-group">
                            <label className="toggle">
                                <input type="checkbox" name="vegOnly" checked={filters.vegOnly} onChange={handleFilterChange} />
                                <span className="toggle-slider" />
                            </label>
                            <label>Veg Only 🥦</label>
                        </div>
                    </div>
                </div>
                <div className="filter-actions">
                    <button className="btn btn-primary" onClick={handleApplyFilter} disabled={loading}>Apply Filters</button>
                    <button className="btn btn-secondary" onClick={handleReset} disabled={loading}>Reset</button>
                    <button className="btn btn-secondary" onClick={handleNearby} disabled={loading}>📍 Nearby (5km)</button>
                    {user && (
                        <button
                            className="btn btn-secondary"
                            onClick={handleRecommend}
                            disabled={loadingRecommend}
                            style={{
                                background: isRecommended ? "var(--accent-light)" : "",
                                color: isRecommended ? "var(--accent)" : "",
                                borderColor: isRecommended ? "var(--accent)" : ""
                            }}
                        >
                            {loadingRecommend ? "Loading…" : isRecommended ? "🎯 Personalised" : "🎯 For You"}
                        </button>
                    )}
                </div>
            </div>

            {/* ── RESULTS META (unchanged) ── */}
            <div className="results-meta">
                <div>
                    {!loading && (
                        <>
                            <strong>{allRestaurants.length}</strong> restaurant{allRestaurants.length !== 1 ? "s" : ""} found
                            {hasActiveFilters && <span style={{ marginLeft: 8, color: "var(--accent)", fontSize: 13 }}>(filtered)</span>}
                            {isRecommended && <span style={{ marginLeft: 8, color: "var(--accent)", fontSize: 13 }}>· personalised for you</span>}
                        </>
                    )}
                </div>
                {!loading && totalPages > 1 && <span>Page {page} of {totalPages}</span>}
            </div>

            {/* ── GRID ── */}
            <div className="restaurant-grid">
                {loading ? (
                    Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)
                ) : paginated.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🍽</div>
                        <h3>No restaurants found</h3>
                        <p>Try adjusting your filters or search in a different area</p>
                        <button className="btn btn-secondary" onClick={handleReset}>Clear filters</button>
                    </div>
                ) : (
                    paginated.map(r => (
                        <div
                            className="restaurant-card"
                            key={r._id}
                            onClick={() => setDetailModal(r)}  // NEW: click to open detail
                            style={{ cursor: "pointer" }}
                        >
                            <div className="card-color-bar" />
                            <div className="card-body">
                                <div className="card-header">
                                    <div className="card-name">{r.name}</div>
                                    <span className={`badge ${r.vegOnly ? "badge-veg" : "badge-nonveg"}`}>
                                        {r.vegOnly ? "🟢 Veg" : "🔴 Non-Veg"}
                                    </span>
                                </div>

                                <div className="card-meta">
                                    <span className="badge badge-cuisine">{r.cuisine}</span>
                                    {r.rating > 0 && <span className="badge badge-rating">★ {r.rating.toFixed(1)}</span>}
                                    {r.score && isRecommended && (
                                        <span className="badge" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                                            🎯 {Math.round(r.score * 100)}% match
                                        </span>
                                    )}
                                </div>

                                <div className="card-detail" style={{ marginBottom: 8 }}>
                                    <span>💰</span>
                                    <span>₹{r.averageCost} avg per person</span>
                                </div>

                                {r.rating > 0 && (
                                    <div className="card-detail" style={{ marginBottom: 8 }}>
                                        <StarRating rating={r.rating} />
                                    </div>
                                )}

                                {r.special && <div className="card-special">✨ {r.special}</div>}

                                {/* Tap hint */}
                                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6 }}>
                                    Tap card for photos, menu & reviews
                                </div>

                                {user && (
                                    <div style={{ marginBottom: 10 }} onClick={e => e.stopPropagation()}>
                                        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>Your rating:</div>
                                        <InteractiveStars restaurantId={r._id} onRate={(id, rating) => handleRate({ stopPropagation: () => { } }, id, rating)} />
                                    </div>
                                )}

                                <div className="card-footer">
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        style={{ flex: 1, justifyContent: "center" }}
                                        onClick={(e) => handleLike(e, r._id, r.name)}
                                    >
                                        {likedIds.has(r._id) ? "❤️ Liked" : "🤍 Like"}
                                    </button>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        style={{ flex: 1, justifyContent: "center" }}
                                        onClick={(e) => handleSave(e, r._id, r.name)}
                                    >
                                        {savedIds.has(r._id) ? "💾 Saved" : "🔖 Save"}
                                    </button>
                                    {user && (
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={(e) => { e.stopPropagation(); setReviewModal(r); }}
                                            title="Write a review"
                                        >✍️</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── PAGINATION (unchanged) ── */}
            {!loading && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                />
            )}

            {/* ── REVIEW MODAL (unchanged) ── */}
            {reviewModal && (
                <ReviewModal
                    restaurant={reviewModal}
                    onClose={() => setReviewModal(null)}
                    onSubmit={handleReviewSubmit}
                />
            )}

            {/* ── NEW: RESTAURANT DETAIL MODAL ── */}
            {detailModal && (
                <RestaurantDetailModal
                    restaurant={detailModal}
                    onClose={() => setDetailModal(null)}
                />
            )}
        </div>
    );
}