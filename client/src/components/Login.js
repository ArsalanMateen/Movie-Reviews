import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

import MovieDataService from "../services/movies";
import cinemaIllustration from "../assets/images/cinema-movie-illustration.png";
import styles from "./Login.module.css";

const Login = ({ login }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Welcome | Movie Reviews";
  }, []);

  const handleReturn = (e) => {
    if (e) {
      e.preventDefault();
    }
    const returnTo =
      location.state?.from && location.state.from !== "/login"
        ? location.state.from
        : null;

    if (returnTo) {
      navigate(returnTo, { state: location.state?.fromState });
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);

    try {
      const response = await MovieDataService.login({
        email: "testuser@example.com",
        password: "testpassword",
      });
      login(
        response.data?.user || {
          name: "Test User",
          email: "testuser@example.com",
        },
      );
      handleReturn();
    } catch {
      login({ name: "Test User", email: "testuser@example.com" });
      handleReturn();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <Link
          to={location.state?.from || "/"}
          state={location.state?.fromState}
          onClick={handleReturn}
          className={styles.back}
        >
          <ArrowLeft size={15} />
          <span>Back to movies</span>
        </Link>

        <div className={styles.illustrationWrapper}>
          <img
            src={cinemaIllustration}
            alt="Welcome to Movie Reviews"
            className={styles.illustration}
          />
        </div>

        <h1 className={styles.title}>Welcome to Movie Reviews</h1>
        <p className={styles.subtitle}>
          Discover, watch and review the best movie
        </p>

        <button
          type="button"
          className={styles.guestLink}
          onClick={handleGuestLogin}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={15} className={styles.spinner} />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Continue as Guest</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Login;
