import { useEffect, useState } from "react";
import API from "../api";

// Cuisine-based Unsplash photo collections (free, no API key)
const CUISINE_PHOTOS = {
    "South Indian": [
        "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&q=80",
        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80",
        "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80",
    ],
    "North Indian": [
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
        "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80",
        "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&q=80",
    ],
    "Chinese": [
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80",
        "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80",
        "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80",
    ],
    "Italian": [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
        "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
    ],
    "Continental": [
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80",
    ],
    "Mexican": [
        "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
        "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&q=80",
        "https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=600&q=80",
    ],
    "Thai": [
        "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600&q=80",
        "https://images.unsplash.com/photo-1569562211093-4ed0d0758359?w=600&q=80",
        "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&q=80",
    ],
    "Street Food": [
        "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=600&q=80",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80",
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
    ],
};

const FALLBACK_PHOTOS = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80",
    "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600&q=80",
];

// Sample menu based on cuisine
const CUISINE_MENUS = {
    "South Indian": [
        { category: "Breakfast", items: [{ name: "Masala Dosa", price: 80 }, { name: "Idli Sambar (3 pcs)", price: 60 }, { name: "Vada (2 pcs)", price: 50 }, { name: "Uttapam", price: 90 }] },
        { category: "Mains", items: [{ name: "Bisi Bele Bath", price: 120 }, { name: "Curd Rice", price: 80 }, { name: "Lemon Rice", price: 90 }, { name: "Meals (Full)", price: 150 }] },
        { category: "Beverages", items: [{ name: "Filter Coffee", price: 30 }, { name: "Buttermilk", price: 25 }, { name: "Fresh Lime Soda", price: 40 }] },
    ],
    "North Indian": [
        { category: "Starters", items: [{ name: "Paneer Tikka", price: 180 }, { name: "Dal Soup", price: 100 }, { name: "Aloo Chaat", price: 90 }] },
        { category: "Mains", items: [{ name: "Butter Chicken", price: 280 }, { name: "Dal Makhani", price: 200 }, { name: "Paneer Butter Masala", price: 220 }, { name: "Biryani", price: 260 }] },
        { category: "Breads", items: [{ name: "Butter Naan", price: 40 }, { name: "Tandoori Roti", price: 30 }, { name: "Garlic Naan", price: 50 }] },
        { category: "Desserts", items: [{ name: "Gulab Jamun", price: 80 }, { name: "Kulfi", price: 90 }] },
    ],
    "Chinese": [
        { category: "Starters", items: [{ name: "Veg Manchurian", price: 150 }, { name: "Spring Rolls (4 pcs)", price: 120 }, { name: "Chilli Paneer", price: 180 }] },
        { category: "Mains", items: [{ name: "Fried Rice", price: 160 }, { name: "Hakka Noodles", price: 150 }, { name: "Chilli Chicken", price: 220 }, { name: "Schezwan Fried Rice", price: 180 }] },
        { category: "Soups", items: [{ name: "Hot & Sour Soup", price: 110 }, { name: "Sweet Corn Soup", price: 100 }] },
    ],
    "Italian": [
        { category: "Starters", items: [{ name: "Bruschetta", price: 160 }, { name: "Garlic Bread", price: 120 }, { name: "Caesar Salad", price: 200 }] },
        { category: "Mains", items: [{ name: "Margherita Pizza", price: 320 }, { name: "Pasta Arrabiata", price: 280 }, { name: "Spaghetti Carbonara", price: 350 }, { name: "Lasagne", price: 380 }] },
        { category: "Desserts", items: [{ name: "Tiramisu", price: 200 }, { name: "Panna Cotta", price: 180 }] },
    ],
    "Continental": [
        { category: "Starters", items: [{ name: "French Onion Soup", price: 180 }, { name: "Stuffed Mushrooms", price: 220 }, { name: "Garden Salad", price: 160 }] },
        { category: "Mains", items: [{ name: "Grilled Chicken", price: 380 }, { name: "Mushroom Risotto", price: 320 }, { name: "Fish & Chips", price: 350 }] },
        { category: "Desserts", items: [{ name: "Crème Brûlée", price: 200 }, { name: "Chocolate Mousse", price: 180 }] },
    ],
    "Mexican": [
        { category: "Starters", items: [{ name: "Nachos & Salsa", price: 160 }, { name: "Guacamole", price: 140 }, { name: "Quesadilla", price: 200 }] },
        { category: "Mains", items: [{ name: "Burrito Bowl", price: 280 }, { name: "Tacos (3 pcs)", price: 260 }, { name: "Enchiladas", price: 300 }, { name: "Fajitas", price: 320 }] },
        { category: "Drinks", items: [{ name: "Virgin Mojito", price: 100 }, { name: "Horchata", price: 90 }] },
    ],
    "Thai": [
        { category: "Starters", items: [{ name: "Thai Spring Rolls", price: 160 }, { name: "Tom Kha Soup", price: 180 }, { name: "Papaya Salad", price: 150 }] },
        { category: "Mains", items: [{ name: "Pad Thai", price: 260 }, { name: "Green Curry", price: 280 }, { name: "Massaman Curry", price: 300 }, { name: "Mango Sticky Rice", price: 180 }] },
    ],
    "Street Food": [
        { category: "Snacks", items: [{ name: "Pani Puri (6 pcs)", price: 40 }, { name: "Bhel Puri", price: 50 }, { name: "Sev Puri", price: 50 }, { name: "Aloo Tikki", price: 60 }] },
        { category: "Mains", items: [{ name: "Chole Bhature", price: 100 }, { name: "Pav Bhaji", price: 90 }, { name: "Vada Pav", price: 30 }, { name: "Frankie", price: 70 }] },
        { category: "Drinks", items: [{ name: "Sugarcane Juice", price: 30 }, { name: "Lassi", price: 50 }, { name: "Chai", price: 20 }] },
    ],
};

function StarDisplay({ rating, size = 14 }) {
    return (
        <span>
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} style={{ color: i <= Math.round(rating) ? "#f59e0b" : "#d1d5db", fontSize: size }}>★</span>
            ))}
        </span>
    );
}

export default function RestaurantDetailModal({ restaurant, onClose }) {
    const [activeTab, setActiveTab] = useState("photos");
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [activePhoto, setActivePhoto] = useState(0);

    const photos = CUISINE_PHOTOS[restaurant.cuisine] || FALLBACK_PHOTOS;
    const menu = CUISINE_MENUS[restaurant.cuisine] || CUISINE_MENUS["Continental"];

    useEffect(() => {
        // Fetch reviews and stats
        API.get(`/interactions/restaurant/${restaurant._id}`)
            .then(res => {
                setStats(res.data.stats);
                const reviewInteractions = res.data.interactions.filter(i => i.type === "review");
                setReviews(reviewInteractions);
            })
            .catch(() => { })
            .finally(() => setLoadingReviews(false));
    }, [restaurant._id]);

    // Close on backdrop click
    const handleBackdrop = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const tabs = ["photos", "menu", "reviews"];

    return (
        <div
            onClick={handleBackdrop}
            style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000, padding: "16px",
                backdropFilter: "blur(4px)",
            }}
        >
            <div style={{
                background: "var(--surface)",
                borderRadius: 20,
                width: "100%",
                maxWidth: 680,
                maxHeight: "90vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
            }}>

                {/* ── HEADER ── */}
                <div style={{
                    padding: "20px 24px 16px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexShrink: 0,
                }}>
                    <div>
                        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", marginBottom: 6 }}>
                            {restaurant.name}
                        </h2>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                            <span className="badge badge-cuisine">{restaurant.cuisine}</span>
                            <span className={`badge ${restaurant.vegOnly ? "badge-veg" : "badge-nonveg"}`}>
                                {restaurant.vegOnly ? "🟢 Veg" : "🔴 Non-Veg"}
                            </span>
                            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                                💰 ₹{restaurant.averageCost} avg
                            </span>
                            {restaurant.rating > 0 && (
                                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
                                    <StarDisplay rating={restaurant.rating} />
                                    <span style={{ color: "var(--text-secondary)" }}>{restaurant.rating.toFixed(1)}</span>
                                </span>
                            )}
                            {stats && (
                                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                    · ❤️ {stats.likes} · 💾 {stats.saves}
                                    {stats.avgRating && ` · ⭐ ${stats.avgRating} user avg`}
                                </span>
                            )}
                        </div>
                        {restaurant.special && (
                            <p style={{ marginTop: 6, fontSize: 13, color: "var(--accent)" }}>✨ {restaurant.special}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontSize: 22, color: "var(--text-secondary)",
                            padding: "4px 8px", borderRadius: 8,
                            lineHeight: 1, flexShrink: 0, marginLeft: 12,
                        }}
                    >✕</button>
                </div>

                {/* ── TABS ── */}
                <div style={{
                    display: "flex",
                    borderBottom: "1px solid var(--border)",
                    flexShrink: 0,
                    padding: "0 24px",
                }}>
                    {tabs.map(t => (
                        <button key={t} onClick={() => setActiveTab(t)}
                            style={{
                                background: "none", border: "none", cursor: "pointer",
                                padding: "12px 20px",
                                fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
                                color: activeTab === t ? "var(--accent)" : "var(--text-secondary)",
                                borderBottom: activeTab === t ? "2px solid var(--accent)" : "2px solid transparent",
                                marginBottom: -1, textTransform: "capitalize",
                                transition: "color 0.15s",
                            }}
                        >
                            {t === "photos" ? "📸 Photos" : t === "menu" ? "🍽 Menu" : `💬 Reviews (${reviews.length})`}
                        </button>
                    ))}
                </div>

                {/* ── BODY ── */}
                <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

                    {/* PHOTOS TAB */}
                    {activeTab === "photos" && (
                        <div>
                            {/* Main photo */}
                            <div style={{
                                borderRadius: 12, overflow: "hidden", marginBottom: 12,
                                height: 280, background: "#f0ede8",
                            }}>
                                <img
                                    src={photos[activePhoto]}
                                    alt={restaurant.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={e => { e.target.src = FALLBACK_PHOTOS[0]; }}
                                />
                            </div>
                            {/* Thumbnails */}
                            <div style={{ display: "flex", gap: 8 }}>
                                {photos.map((p, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setActivePhoto(i)}
                                        style={{
                                            width: 72, height: 56, borderRadius: 8, overflow: "hidden",
                                            cursor: "pointer", flexShrink: 0,
                                            border: i === activePhoto ? "2px solid var(--accent)" : "2px solid transparent",
                                            opacity: i === activePhoto ? 1 : 0.65,
                                            transition: "opacity 0.15s, border 0.15s",
                                        }}
                                    >
                                        <img src={p} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            onError={e => { e.target.src = FALLBACK_PHOTOS[0]; }} />
                                    </div>
                                ))}
                            </div>
                            <p style={{ marginTop: 12, fontSize: 12, color: "var(--text-secondary)" }}>
                                Reference photos based on {restaurant.cuisine} cuisine
                            </p>
                        </div>
                    )}

                    {/* MENU TAB */}
                    {activeTab === "menu" && (
                        <div>
                            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
                                Sample menu · Prices in ₹ · Actual menu may vary
                            </p>
                            {menu.map(section => (
                                <div key={section.category} style={{ marginBottom: 24 }}>
                                    <h3 style={{
                                        fontSize: 12, fontWeight: 700, textTransform: "uppercase",
                                        letterSpacing: "0.08em", color: "var(--accent)",
                                        marginBottom: 10, paddingBottom: 6,
                                        borderBottom: "1px solid var(--border)",
                                    }}>
                                        {section.category}
                                    </h3>
                                    {section.items.map(item => (
                                        <div key={item.name} style={{
                                            display: "flex", justifyContent: "space-between",
                                            alignItems: "center", padding: "8px 0",
                                            borderBottom: "1px solid var(--border-light, #f0ede8)",
                                        }}>
                                            <span style={{ fontSize: 14, color: "var(--text)" }}>{item.name}</span>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>
                                                ₹{item.price}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* REVIEWS TAB */}
                    {activeTab === "reviews" && (
                        <div>
                            {/* Stats bar */}
                            {stats && stats.ratings > 0 && (
                                <div style={{
                                    background: "var(--surface-2)", borderRadius: 12,
                                    padding: "16px 20px", marginBottom: 20,
                                    display: "flex", gap: 32, flexWrap: "wrap",
                                }}>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-display)" }}>
                                            {stats.avgRating}
                                        </div>
                                        <StarDisplay rating={stats.avgRating} size={16} />
                                        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                                            {stats.ratings} rating{stats.ratings !== 1 ? "s" : ""}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: 20, fontWeight: 700 }}>❤️ {stats.likes}</div>
                                            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>likes</div>
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: 20, fontWeight: 700 }}>💾 {stats.saves}</div>
                                            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>saves</div>
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: 20, fontWeight: 700 }}>💬 {stats.reviews}</div>
                                            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>reviews</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loadingReviews ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{ padding: 16, borderRadius: 12, background: "var(--surface-2)" }}>
                                            <div className="skeleton skeleton-text" style={{ width: "30%", height: 14, marginBottom: 8 }} />
                                            <div className="skeleton skeleton-text" style={{ width: "80%", height: 12 }} />
                                        </div>
                                    ))}
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="empty-state" style={{ padding: "40px 0" }}>
                                    <div className="empty-icon">💬</div>
                                    <h3>No reviews yet</h3>
                                    <p>Be the first to share your experience!</p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    {reviews.map(r => (
                                        <div key={r._id} style={{
                                            padding: "16px 20px",
                                            background: "var(--surface-2)",
                                            borderRadius: 12,
                                            border: "1px solid var(--border)",
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div style={{
                                                        width: 36, height: 36, borderRadius: "50%",
                                                        background: "var(--accent)", color: "white",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontWeight: 700, fontSize: 14, flexShrink: 0,
                                                    }}>
                                                        {(r.userName || "A")[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.userName || "Anonymous"}</div>
                                                        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                                                            {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                        </div>
                                                    </div>
                                                </div>
                                                {r.rating && <StarDisplay rating={r.rating} size={14} />}
                                            </div>
                                            <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6, margin: 0 }}>
                                                {r.review}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}