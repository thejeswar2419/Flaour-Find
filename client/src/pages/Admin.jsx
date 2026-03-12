import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const CUISINES = ["South Indian", "North Indian", "Continental", "Chinese", "Italian", "Mexican", "Thai", "Street Food"];

const EMPTY_FORM = {
    name: "", cuisine: "", averageCost: "", rating: "", vegOnly: false, special: "",
    lat: "12.9716", lng: "77.5946",
};

export default function Admin() {
    const { isAdmin } = useContext(AuthContext);
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [restaurants, setRestaurants] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        if (!isAdmin) { navigate("/login"); return; }
        fetchRestaurants();
    }, [isAdmin]);

    const fetchRestaurants = async () => {
        setLoadingList(true);
        try {
            const res = await API.get("/restaurants");
            setRestaurants(res.data);
        } catch {
            toast("Failed to load restaurants", "error");
        } finally {
            setLoadingList(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post("/restaurants", {
                name: form.name,
                cuisine: form.cuisine,
                averageCost: Number(form.averageCost),
                rating: form.rating ? Number(form.rating) : 0,
                vegOnly: form.vegOnly,
                special: form.special || undefined,
                location: {
                    type: "Point",
                    coordinates: [Number(form.lng), Number(form.lat)],
                },
            });
            toast(`"${form.name}" added successfully! 🎉`, "success");
            setForm(EMPTY_FORM);
            fetchRestaurants();
        } catch (err) {
            toast(err.response?.data?.error || "Failed to add restaurant", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        setDeletingId(id);
        try {
            await API.delete(`/restaurants/${id}`);
            toast(`"${name}" deleted`, "info");
            setRestaurants(r => r.filter(x => x._id !== id));
        } catch {
            toast("Delete failed", "error");
        } finally {
            setDeletingId(null);
        }
    };

    const startEdit = (r) => {
        setEditingId(r._id);
        setEditForm({
            name: r.name,
            cuisine: r.cuisine,
            averageCost: r.averageCost,
            rating: r.rating || "",
            vegOnly: r.vegOnly,
            special: r.special || "",
            lat: r.location?.coordinates?.[1] ?? "12.9716",
            lng: r.location?.coordinates?.[0] ?? "77.5946",
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSaveEdit = async (id) => {
        setSavingEdit(true);
        try {
            await API.put(`/restaurants/${id}`, {
                name: editForm.name,
                cuisine: editForm.cuisine,
                averageCost: Number(editForm.averageCost),
                rating: editForm.rating ? Number(editForm.rating) : 0,
                vegOnly: editForm.vegOnly,
                special: editForm.special || undefined,
                location: {
                    type: "Point",
                    coordinates: [Number(editForm.lng), Number(editForm.lat)],
                },
            });
            toast(`"${editForm.name}" updated!`, "success");
            setEditingId(null);
            fetchRestaurants();
        } catch (err) {
            toast(err.response?.data?.error || "Update failed", "error");
        } finally {
            setSavingEdit(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>Admin Panel</h1>
                <p>Manage restaurant listings</p>
            </div>

            <div className="admin-grid">
                {/* ── ADD FORM ── */}
                <div className="admin-card">
                    <h2>Add Restaurant</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Restaurant name *</label>
                            <input name="name" placeholder="e.g. The Spice Garden" value={form.name} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Cuisine *</label>
                            <select name="cuisine" value={form.cuisine} onChange={handleChange} required>
                                <option value="">Select cuisine…</option>
                                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Avg cost (₹) *</label>
                                <input type="number" name="averageCost" placeholder="350" value={form.averageCost} onChange={handleChange} required min="1" />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Rating (0–5)</label>
                                <input type="number" name="rating" placeholder="4.2" value={form.rating} onChange={handleChange} min="0" max="5" step="0.1" />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: 8 }}>
                            <label>Specialty dish</label>
                            <input name="special" placeholder="e.g. Butter Chicken, Dosa" value={form.special} onChange={handleChange} />
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Latitude</label>
                                <input type="number" name="lat" value={form.lat} onChange={handleChange} step="any" />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Longitude</label>
                                <input type="number" name="lng" value={form.lng} onChange={handleChange} step="any" />
                            </div>
                        </div>

                        <div className="toggle-group" style={{ marginTop: 8 }}>
                            <label className="toggle">
                                <input type="checkbox" name="vegOnly" checked={form.vegOnly} onChange={handleChange} />
                                <span className="toggle-slider" />
                            </label>
                            <label>Vegetarian only</label>
                        </div>

                        <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 16 }} disabled={submitting}>
                            {submitting ? "Adding…" : "Add Restaurant"}
                        </button>
                    </form>
                </div>

                {/* ── RESTAURANT LIST ── */}
                <div className="admin-card">
                    <h2>All Restaurants ({restaurants.length})</h2>
                    {loadingList ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="restaurant-list-item">
                                <div className="skeleton skeleton-text" style={{ width: "60%", height: 14 }} />
                                <div className="skeleton" style={{ width: 60, height: 28, borderRadius: 6 }} />
                            </div>
                        ))
                    ) : restaurants.length === 0 ? (
                        <div className="empty-state" style={{ padding: "32px 0" }}>
                            <div className="empty-icon">🏪</div>
                            <h3>No restaurants yet</h3>
                            <p>Add the first one using the form</p>
                        </div>
                    ) : (
                        restaurants.map(r => (
                            <div key={r._id}>
                                {/* ── VIEW ROW ── */}
                                {editingId !== r._id ? (
                                    <div className="restaurant-list-item">
                                        <div className="restaurant-list-item-info">
                                            <strong>{r.name}</strong>
                                            <span>{r.cuisine} · ₹{r.averageCost} · {r.vegOnly ? "🟢 Veg" : "🔴 Non-Veg"}{r.rating > 0 ? ` · ★ ${r.rating}` : ""}{r.special ? ` · ${r.special}` : ""}</span>
                                        </div>
                                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => startEdit(r)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => handleDelete(r._id, r.name)}
                                                disabled={deletingId === r._id}
                                                style={{ color: "var(--error)" }}
                                            >
                                                {deletingId === r._id ? "…" : "Delete"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* ── EDIT INLINE FORM ── */
                                    <div style={{ padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                                        <div className="form-row" style={{ marginBottom: 8 }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label>Name *</label>
                                                <input name="name" value={editForm.name} onChange={handleEditChange} required />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label>Cuisine *</label>
                                                <select name="cuisine" value={editForm.cuisine} onChange={handleEditChange} required>
                                                    {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-row" style={{ marginBottom: 8 }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label>Avg Cost (₹) *</label>
                                                <input type="number" name="averageCost" value={editForm.averageCost} onChange={handleEditChange} required min="1" />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label>Rating (0–5)</label>
                                                <input type="number" name="rating" value={editForm.rating} onChange={handleEditChange} min="0" max="5" step="0.1" />
                                            </div>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 8 }}>
                                            <label>Specialty dish</label>
                                            <input name="special" value={editForm.special} onChange={handleEditChange} />
                                        </div>
                                        <div className="form-row" style={{ marginBottom: 8 }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label>Latitude</label>
                                                <input type="number" name="lat" value={editForm.lat} onChange={handleEditChange} step="any" />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label>Longitude</label>
                                                <input type="number" name="lng" value={editForm.lng} onChange={handleEditChange} step="any" />
                                            </div>
                                        </div>
                                        <div className="toggle-group" style={{ marginBottom: 12 }}>
                                            <label className="toggle">
                                                <input type="checkbox" name="vegOnly" checked={editForm.vegOnly} onChange={handleEditChange} />
                                                <span className="toggle-slider" />
                                            </label>
                                            <label>Vegetarian only</label>
                                        </div>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleSaveEdit(r._id)}
                                                disabled={savingEdit}
                                            >
                                                {savingEdit ? "Saving…" : "Save Changes"}
                                            </button>
                                            <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}