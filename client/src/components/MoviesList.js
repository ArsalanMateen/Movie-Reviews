import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { Search, Star, X } from "lucide-react";

import MovieDataService from "../services/movies.js";
import illustration from "../assets/images/cinema-movie-illustration.png";
import noMoviePoster from "../assets/images/no-movie-poster.png";
import Pagination from "./Pagination.js";
import styles from "./MoviesList.module.css";

// component for displaying a list of movies with search, filter, sort and pagination functionality
const MoviesList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Extract query parameters from the URL, providing default values if they are not present
  const sort = searchParams.get("sort") || "yearDesc";
  const searchGenre = searchParams.get("genre") || "All Genres";
  const submittedTitle = searchParams.get("title") || "";
  const currentPage = parseInt(searchParams.get("page"), 10) || 0; // 10 is the radix parameter that specifies the base of the numeral system to be used

  const [movies, setMovies] = useState([]); // state to hold the list of movies retrieved from the API
  const [searchTitle, setSearchTitle] = useState(submittedTitle); // state to hold the current value of the search input box
  const [genres, setGenres] = useState(["All Genres"]); // state to hold the list of genres retrieved from the API
  const [totalResults, setTotalResults] = useState(0); // state to hold the total number of movies retrieved from the API
  const [moviesPerPage, setMoviesPerPage] = useState(20); // state to hold the number of movies to display per page, defaulting to 20

  useEffect(() => {
    document.title = "Movie Reviews";
    retrieveGenres();
  }, []);

  const retrieveGenres = () => {
    MovieDataService.getGenres()
      .then((response) => {
        setGenres(["All Genres"].concat(response?.data || []));
      })
      .catch((e) => {
        console.error("Error retrieving genres:", e);
      });
  };

  // synchronize the input box whenever the URL's title parameter changes (e.g. back button)
  useEffect(() => {
    setSearchTitle(submittedTitle);
  }, [submittedTitle]);

  // useCallback(() => { ... }, [dependencies]);
  const updateQueryParams = useCallback(
    (updates) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        const defaultValues = {
          page: 0,
          genre: "All Genres",
          sort: "yearDesc",
        };

        Object.entries(updates).forEach(([key, value]) => {
          // Object.entries(object) return an array of a [key value] paris for each property.
          if (value == null || value === "" || value === defaultValues[key]) {
            params.delete(key);
          } else {
            params.set(key, String(value));
          }
        });
        return params;
      });
    },
    [setSearchParams],
  );

  const retrieveMovies = useCallback(() => {
    MovieDataService.getAll(currentPage, sort, moviesPerPage)
      .then((response) => {
        setMovies(response?.data?.moviesList || []);
        setTotalResults(response?.data?.totalMovies || 0);
      })
      .catch((e) => {
        console.error("Error retrieving movies:", e);
      });
  }, [currentPage, sort, moviesPerPage]);

  const searchMovies = useCallback(
    (query, by) => {
      MovieDataService.find(query, by, currentPage, moviesPerPage, sort)
        .then((response) => {
          setMovies(response?.data?.moviesList || []);
          setTotalResults(response?.data?.totalMovies || 0);
        })
        .catch((e) => {
          console.error("Error finding movies:", e);
        });
    },
    [currentPage, moviesPerPage, sort],
  );

  useEffect(() => {
    if (searchGenre !== "All Genres") {
      searchMovies(searchGenre, "genre");
    } else if (submittedTitle) {
      searchMovies(submittedTitle, "title");
    } else {
      retrieveMovies();
    }
  }, [
    currentPage,
    sort,
    moviesPerPage,
    searchGenre,
    submittedTitle,
    retrieveMovies, // included because the function is used inside the effect (React requirement)
    searchMovies,
  ]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQueryParams({
      title: searchTitle.trim(),
      page: 0,
      genre: "All Genres",
    });
  };

  const handleClearSearch = () => {
    setSearchTitle("");
    updateQueryParams({ title: "" });
  };

  const handleGenreChange = (e) => {
    const newGenre = e.target.value;
    setSearchTitle("");
    updateQueryParams({ genre: newGenre, page: 0, title: "" });
  };

  const handleSortChange = (e) => {
    updateQueryParams({ sort: e.target.value, page: 0 });
  };

  const handlePerPageChange = (e) => {
    setMoviesPerPage(parseInt(e.target.value, 10));
    updateQueryParams({ page: 0 });
  };

  const handlePageChange = (newPage) => {
    updateQueryParams({ page: newPage });
  };

  const totalPages = Math.ceil(totalResults / moviesPerPage); // pages required to display all movies according to the selected number of movies per page
  const startResult = totalResults === 0 ? 0 : currentPage * moviesPerPage + 1; // starting index of the movies displayed on the current page
  const endResult = Math.min((currentPage + 1) * moviesPerPage, totalResults); // ending index of the movies displayed on the current page, ensuring it does not exceed the total number of results

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>Movies</h1>
          <p className={styles.headerSubtitle}>
            Discover, watch, and review the best movies.
          </p>
        </div>
        <img
          src={illustration}
          alt="Cinema"
          className={styles.headerIllustration}
        />
      </div>

      <div className={styles.searchBar}>
        <div className={styles.searchBarRow}>
          <div className={styles.searchBarGroup}>
            <label className={styles.searchBarLabel}>Search by title</label>
            <form
              onSubmit={handleSearchSubmit}
              className={styles.searchBarInputWrapper}
            >
              <input
                type="text"
                className={styles.searchBarInput}
                placeholder="Search movies by title"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
              <div className={styles.searchBarActions}>
                {searchTitle && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    title="Clear search"
                    className={styles.searchBarActionButton}
                  >
                    <X size={15} />
                  </button>
                )}
                <button
                  type="submit"
                  title="Search"
                  className={styles.searchBarActionButton}
                >
                  <Search size={18} />
                </button>
              </div>
            </form>
          </div>

          <div className={styles.searchBarGroup}>
            <label className={styles.searchBarLabel}>Genre</label>
            <select
              className={styles.searchBarSelect}
              value={searchGenre}
              onChange={handleGenreChange}
            >
              {genres.map((genre, i) => (
                <option key={i} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.searchBarGroup}>
            <label className={styles.searchBarLabel}>Sort by</label>
            <select
              className={styles.searchBarSelect}
              value={sort}
              onChange={handleSortChange}
            >
              <option value="yearDesc">Newest Releases</option>
              <option value="yearAsc">Oldest Releases</option>
              <option value="ratingDesc">Highest Rated</option>
              <option value="ratingAsc">Lowest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.resultsInfo}>
        <span className={styles.resultsText}>
          Showing {startResult}-{endResult} of {totalResults.toLocaleString()}{" "}
          {/* formatting the total results with commas for better readability */}
        </span>
        <div className={styles.resultsPerPage}>
          Items per page
          <select value={moviesPerPage} onChange={handlePerPageChange}>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>

      <div className={styles.moviesGrid}>
        {movies.map((movie) => (
          <div className={styles.movieCard} key={movie._id}>
            <Link
              to={"/movies/" + movie._id}
              state={{ from: `${location.pathname}${location.search}` }}
              className={styles.movieCardLink}
            >
              <div className={styles.posterWrapper}>
                <img
                  className={styles.poster}
                  src={movie.poster || noMoviePoster}
                  alt={movie.title}
                  onError={(e) => {
                    e.target.src = noMoviePoster;
                  }}
                />
              </div>
              <div className={styles.movieCardBody}>
                <h5 className={styles.movieTitle}>{movie.title}</h5>
                <div className={styles.movieMeta}>
                  <span className={styles.movieYear}>{movie.year}</span>
                </div>
                {movie.genres && (
                  <div className={styles.movieGenres}>
                    {movie.genres.join(", ")}
                  </div>
                )}
                <p className={styles.moviePlot}>
                  {movie.plot || "No plot available."}
                </p>
                {movie.imdb && movie.imdb.rating > 0 && (
                  <div className={styles.rating}>
                    <Star
                      size={14}
                      className={styles.ratingStar}
                      fill="#f5c518"
                      color="#f5c518"
                    />
                    <span className={styles.ratingValue}>
                      {movie.imdb.rating}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default MoviesList;
