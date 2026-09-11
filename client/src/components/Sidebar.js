import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Film, TrendingUp, User, LogIn, LogOut } from "lucide-react";

import logo from "../assets/images/logo.png";
import styles from "./Sidebar.module.css";

const Sidebar = ({ user, logout }) => {
  const location = useLocation();

  const isRouteActive = (pathname, search = "") => {
    if (pathname === "/") {
      if (search) {
        return location.pathname === "/" && location.search === search;
      }
      return (
        (location.pathname === "/" || location.pathname === "/movies") &&
        (!location.search || location.search === "" || location.search === "?")
      );
    }
    return location.pathname.startsWith(pathname);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src={logo} alt="Movie Reviews" className={styles.logoImage} />
      </div>

      <div className={styles.content}>
        <span className={styles.sectionTitle}>Discover</span>
        <nav className={styles.nav}>
          <Link
            to="/"
            className={`${styles.navItem} ${isRouteActive("/", "") ? styles.navItemActive : ""}`}
          >
            <Film size={18} className={styles.navIcon} />
            <span className={styles.navLabel}>Explore All</span>
          </Link>

          <Link
            to="/?sort=ratingDesc"
            className={`${styles.navItem} ${isRouteActive("/", "?sort=ratingDesc") ? styles.navItemActive : ""}`}
          >
            <TrendingUp size={18} className={styles.navIcon} />
            <span className={styles.navLabel}>Top Rated</span>
            <span className={styles.pillTag}>HOT</span>
          </Link>
        </nav>
      </div>

      <div className={styles.footer}>
        {user ? (
          <div className={styles.profileCard}>
            <div className={styles.avatar}>
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              <span className={styles.statusDot} />
            </div>
            <div className={styles.profileDetails}>
              <span className={styles.profileName} title={user.name}>
                {user.name}
              </span>
            </div>
            <button
              className={styles.logoutButton}
              onClick={logout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            state={
              location.pathname !== "/login"
                ? {
                    from: `${location.pathname}${location.search}`,
                    fromState: location.state,
                  }
                : location.state
            }
            className={styles.guestProfile}
            title="Sign in"
          >
            <div className={styles.guestAvatar}>
              <User size={18} />
            </div>
            <div className={styles.guestDetails}>
              <span className={styles.guestName}>Sign in</span>
            </div>
            <div className={styles.guestArrow}>
              <LogIn size={16} />
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
