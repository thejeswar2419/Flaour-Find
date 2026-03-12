import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const decodeToken = (token) => JSON.parse(atob(token.split(".")[1]));

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { adminLogin, userLogin } = useContext(AuthContext);
    const toast = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setError("");
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Try admin first (before hitting the API)
        if (adminLogin(form.email, form.password)) {
            toast("Welcome back, Admin!", "success");
            navigate("/admin");
            return;
        }

        try {
            const res = await API.post("/login", form);
            const token = res.data.token;
            const decoded = decodeToken(token);
            userLogin({ _id: decoded.id, email: decoded.email }, token);
            toast("Welcome back! 🎉", "success");
            navigate("/");
        } catch (err) {
            const msg = err.response?.data?.message || "Invalid email or password";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Welcome back</h1>
                <p className="subtitle">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </p>

                {error && <div className="form-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email / Username</label>
                        {/* type="text" so "admin" passes browser validation */}
                        <input
                            type="text"
                            name="email"
                            placeholder="you@example.com or admin"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        style={{ marginTop: 8 }}
                        disabled={loading}
                    >
                        {loading ? "Signing in…" : "Sign in"}
                    </button>
                </form>

                <div style={{ marginTop: 20, padding: "14px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--text-secondary)" }}>
                    <strong>Admin?</strong> Use <code>admin</code> / <code>admin123</code>
                </div>
            </div>
        </div>
    );
}