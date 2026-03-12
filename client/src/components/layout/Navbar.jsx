import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Navbar() {
    const { user, isAdmin, logout } = useContext(AuthContext);
    const { pathname } = useLocation();
    const isActive = (path) => pathname === path ? "active" : "";

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                🍴 <span>Flavour</span>Find
            </Link>

            <div className="navbar-links">
                <Link to="/" className={isActive("/")}>Browse</Link>
                {isAdmin && <Link to="/admin" className={isActive("/admin")}>Admin</Link>}
                {user && <Link to="/profile" className={isActive("/profile")}>Profile</Link>}
                {!user && !isAdmin && (
                    <>
                        <Link to="/login" className={isActive("/login")}>Login</Link>
                        <Link to="/register" className={isActive("/register")}>Register</Link>
                    </>
                )}
                {(user || isAdmin) && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "8px" }}>
                        {user && (
                            <div className="navbar-user">
                                <div className="avatar">{user.email?.[0]?.toUpperCase()}</div>
                                <span>{user.email?.split("@")[0]}</span>
                            </div>
                        )}
                        {isAdmin && !user && (
                            <div className="navbar-user">
                                <div className="avatar">A</div>
                                <span>Admin</span>
                            </div>
                        )}
                        <button className="btn-logout" onClick={logout}>Sign out</button>
                    </div>
                )}
            </div>
        </nav>
    );
}
