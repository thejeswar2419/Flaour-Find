import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import { useToast } from "../context/ToastContext";

const CUISINES = ["South Indian", "North Indian", "Continental", "Chinese", "Italian", "Mexican", "Thai", "Street Food"];

export default function Register() {
    const [form, setForm] = useState({
        name: "", email: "", password: "", confirmPassword: "",
        preferredCuisine: "", budget: "", vegOnly: false,
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setError("");
        setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await API.post("/register", {
                name: form.name,
                email: form.email,
                password: form.password,
                preferredCuisine: form.preferredCuisine,
                budget: form.budget ? Number(form.budget) : undefined,
                vegOnly: form.vegOnly,
            });
            toast("Account created! Please sign in. 🎉", "success");
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Create account</h1>
                <p className="subtitle">
                    Already have one? <Link to="/login">Sign in</Link>
                </p>

                {error && <div className="form-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full name</label>
                        <input name="name" placeholder="Jane Smith" value={form.name} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Email address</label>
                        <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                    </div>

                    <div className="form-row">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Password</label>
                            <input type="password" name="password" placeholder="Min. 6 chars" value={form.password} onChange={handleChange} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Confirm password</label>
                            <input type="password" name="confirmPassword" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
                        </div>
                    </div>

                    <div style={{ borderTop: "1px solid var(--border)", margin: "20px 0 16px", paddingTop: 16 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
                            Food Preferences (optional)
                        </p>

                        <div className="form-row">
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Preferred cuisine</label>
                                <select name="preferredCuisine" value={form.preferredCuisine} onChange={handleChange}>
                                    <option value="">Any</option>
                                    {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Budget per meal (₹)</label>
                                <input type="number" name="budget" placeholder="e.g. 300" value={form.budget} onChange={handleChange} min="0" />
                            </div>
                        </div>

                        <div className="toggle-group" style={{ marginTop: 14 }}>
                            <label className="toggle">
                                <input type="checkbox" name="vegOnly" checked={form.vegOnly} onChange={handleChange} />
                                <span className="toggle-slider" />
                            </label>
                            <label>Vegetarian only 🥦</label>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? "Creating account…" : "Create account"}
                    </button>
                </form>
            </div>
        </div>
    );
}
