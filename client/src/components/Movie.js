import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import {
  Star,
  Edit3,
  Trash2,
  Clock,
  Calendar,
  User,
  ArrowLeft,
  Send,
  Loader2,
} from "lucide-react";

import MovieDataService from "../services/movies";
import noMoviePoster from "../assets/images/no-movie-poster.png";
import styles from "./Movie.module.css";

const Movie = (props) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [movie, setMovie] = useState({
    id: null,
    title: "",
    rated: "",
    reviews: [],
  });
  const [isPlotExpanded, setIsPlotExpanded] = useState(false);
  const [canExpandPlot, setCanExpandPlot] = useState(false);
  const plotRef = useRef(null);

  const getMovie = (id) => {
    MovieDataService.get(id)
      .then((response) => {
        if (response.data && Array.isArray(response.data.reviews)) {
          response.data.reviews.sort(
            (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
          );
        }
        setMovie(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    getMovie(id);
  }, [id]);

  useEffect(() => {
    if (movie && movie.title) {
      document.title = movie.title;
    } else {
      document.title = "Movie Details";
    }
  }, [movie]);

  useEffect(() => {
    setIsPlotExpanded(false);
    setCanExpandPlot(false);

    const checkOverflow = () => {
      if (plotRef.current) {
        const hasOverflow =
          plotRef.current.scrollHeight > plotRef.current.clientHeight + 2;
        if (hasOverflow) {
          setCanExpandPlot(true);
        }
      }
    };

    const timer = setTimeout(checkOverflow, 50);
    window.addEventListener("resize", checkOverflow);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [movie]);

  const deleteReview = (reviewId) => {
    MovieDataService.deleteReview(
      reviewId,
      props.user?.email,
      props.user?._id || props.user?.email,
    )
      .then(() => {
        setMovie((prevState) => ({
          ...prevState,
          reviews: prevState.reviews.filter((r) => r._id !== reviewId),
        }));
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const [newReviewText, setNewReviewText] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const getAvatarColor = (name = "") => {
    const colors = [
      "linear-gradient(135deg, #6c5ce7 0%, #8c7ae6 100%)",
      "linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)",
      "linear-gradient(135deg, #00b894 0%, #55efc4 100%)",
      "linear-gradient(135deg, #e17055 0%, #fab1a0 100%)",
      "linear-gradient(135deg, #e84393 0%, #fd79a8 100%)",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    setSubmitting(true);
    setReviewError("");

    if (editingReviewId) {
      const data = {
        review_id: editingReviewId,
        text: newReviewText.trim(),
        review: newReviewText.trim(),
        name: props.user.name,
        email: props.user.email,
        user_id: props.user._id || props.user.email,
        movie_id: id,
      };
      MovieDataService.updateReview(data)
        .then(() => {
          setMovie((prevState) => {
            const updated = prevState.reviews.map((r) =>
              r._id === editingReviewId
                ? {
                    ...r,
                    text: newReviewText.trim(),
                    review: newReviewText.trim(),
                    date: new Date().toISOString(),
                  }
                : r,
            );
            updated.sort(
              (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
            );
            return {
              ...prevState,
              reviews: updated,
            };
          });
          setNewReviewText("");
          setEditingReviewId(null);
        })
        .catch((e) => {
          console.error(e);
          setReviewError("Failed to update review. Please try again.");
        })
        .finally(() => setSubmitting(false));
    } else {
      const data = {
        text: newReviewText.trim(),
        review: newReviewText.trim(),
        name: props.user.name,
        email: props.user.email,
        user_id: props.user._id || props.user.email,
        movie_id: id,
      };
      MovieDataService.createReview(data)
        .then(() => {
          getMovie(id);
          setNewReviewText("");
        })
        .catch((e) => {
          console.error(e);
          setReviewError("Failed to submit review. Please try again.");
        })
        .finally(() => setSubmitting(false));
    }
  };

  const handleStartEdit = (review) => {
    setEditingReviewId(review._id);
    setNewReviewText(review.text || review.review || "");
    setReviewError("");
    document
      .getElementById("review-composer")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setNewReviewText("");
    setReviewError("");
  };

  return (
    <div className={styles.movieDetail}>
      <Link
        to={location.state?.from || "/"}
        onClick={(e) => {
          if (
            !location.state?.from &&
            window.history.state &&
            window.history.state.idx > 0
          ) {
            e.preventDefault();
            navigate(-1);
          }
        }}
        className={styles.back}
      >
        <ArrowLeft size={15} />
        <span>Back to movies</span>
      </Link>

      <div className={styles.header}>
        <img
          className={styles.poster}
          src={movie.poster || noMoviePoster}
          alt={movie.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = noMoviePoster;
          }}
        />

        <div className={styles.info}>
          <h1 className={styles.title}>{movie.title}</h1>

          <div className={styles.meta}>
            {movie.year && (
              <span className={styles.year}>
                <Calendar
                  size={13}
                  style={{ verticalAlign: "-1px", marginRight: "4px" }}
                />
                {movie.year}
              </span>
            )}
            {movie.runtime && (
              <span className={styles.runtime}>
                <Clock
                  size={13}
                  style={{ verticalAlign: "-1px", marginRight: "4px" }}
                />
                {movie.runtime} min
              </span>
            )}
          </div>

          {movie.genres && (
            <div className={styles.genres}>
              {movie.genres.map((genre, i) => (
                <span key={i} className={styles.genreTag}>
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div className={styles.plotWrapper}>
            <p
              ref={plotRef}
              className={`${styles.plot} ${
                isPlotExpanded ? styles.plotExpanded : ""
              }`}
            >
              {movie.fullplot || movie.plot || "No plot available."}
            </p>
            {canExpandPlot && (
              <button
                type="button"
                className={styles.plotToggle}
                onClick={() => setIsPlotExpanded(!isPlotExpanded)}
              >
                {isPlotExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          <div className={styles.stats}>
            {movie.imdb && movie.imdb.rating > 0 && (
              <div className={styles.stat}>
                <div className={styles.statValue}>
                  <Star size={18} fill="#f5c518" color="#f5c518" />
                  <span>{movie.imdb.rating}</span>
                </div>
                <div className={styles.statLabel}>IMDb Rating</div>
              </div>
            )}
            {movie.imdb && movie.imdb.votes > 0 && (
              <div className={styles.stat}>
                <div className={styles.statValue}>
                  {movie.imdb.votes.toLocaleString()}
                </div>
                <div className={styles.statLabel}>Votes</div>
              </div>
            )}
          </div>

          {movie.cast && movie.cast.length > 0 && (
            <div className={styles.cast}>
              <div className={styles.castTitle}>Cast</div>
              <div className={styles.castList}>
                {movie.cast.slice(0, 6).join(", ")}
              </div>
            </div>
          )}

          {movie.directors && movie.directors.length > 0 && (
            <div className={styles.cast}>
              <div className={styles.castTitle}>
                {movie.directors.length > 1 ? "Directors" : "Director"}
              </div>
              <div className={styles.castList}>
                {movie.directors.join(", ")}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.reviewsSection}>
        <div className={styles.reviewsHeader}>
          <h2 className={styles.reviewsTitle}>
            Reviews ({movie.reviews ? movie.reviews.length : 0})
          </h2>
        </div>

        {props.user ? (
          <form
            id="review-composer"
            className={styles.composer}
            onSubmit={handleReviewSubmit}
          >
            <div className={styles.composerBody}>
              <div
                className={styles.composerAvatar}
                style={{ background: getAvatarColor(props.user.name) }}
              >
                {props.user.name
                  ? props.user.name.charAt(0).toUpperCase()
                  : "U"}
              </div>
              <div className={styles.composerContent}>
                <textarea
                  className={styles.composerTextarea}
                  placeholder="Share your thoughts about this movie..."
                  value={newReviewText}
                  onChange={(e) =>
                    setNewReviewText(e.target.value.slice(0, 1000))
                  }
                  rows={2}
                  required
                />
                <div className={styles.composerFooter}>
                  <span className={styles.counter}>
                    {newReviewText.length} / 1000 characters
                  </span>
                  <div className={styles.actions}>
                    {editingReviewId && (
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={submitting || !newReviewText.trim()}
                      title={
                        editingReviewId ? "Update Review" : "Submit Review"
                      }
                      aria-label={
                        editingReviewId ? "Update Review" : "Submit Review"
                      }
                    >
                      {submitting ? (
                        <Loader2 size={16} className={styles.spinner} />
                      ) : (
                        <Send size={15} className={styles.btnIcon} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {reviewError && <div className={styles.error}>{reviewError}</div>}
          </form>
        ) : (
          <div className={styles.guestNotice}>
            <div className={styles.guestAvatar}>
              <User size={18} />
            </div>
            <div className={styles.guestText}>
              <Link
                to="/login"
                state={{
                  from: `${location.pathname}${location.search}`,
                  fromState: location.state,
                }}
                className={styles.guestLink}
              >
                Sign in
              </Link>{" "}
              to share your thoughts about this movie.
            </div>
          </div>
        )}

        {movie.reviews && movie.reviews.length > 0 && (
          <div className={styles.reviewsList}>
            {[...movie.reviews]
              .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
              .map((review, index) => (
                <div key={review._id || index} className={styles.reviewCard}>
                  <div
                    className={styles.reviewAvatar}
                    style={{ background: getAvatarColor(review.name) }}
                  >
                    {review.name ? review.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className={styles.reviewContent}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewAuthor}>{review.name}</span>
                      <div className={styles.reviewMeta}>
                        <span className={styles.reviewDate}>
                          {moment(review.date).format("MMM DD, YYYY")}
                        </span>
                        {props.user &&
                          ((props.user.email &&
                            review.email &&
                            props.user.email.trim().toLowerCase() ===
                              review.email.trim().toLowerCase()) ||
                            (props.user._id &&
                              review.user_id &&
                              props.user._id === review.user_id)) && (
                            <div className={styles.reviewActions}>
                              <button
                                className={`${styles.actionButton} ${styles.editButton}`}
                                onClick={() => handleStartEdit(review)}
                                title="Edit Review"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                onClick={() => deleteReview(review._id)}
                                title="Delete Review"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                    <p className={styles.reviewText}>
                      {review.text || review.review}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Movie;
