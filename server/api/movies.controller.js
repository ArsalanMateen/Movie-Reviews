import MoviesDAO from "../dao/moviesDAO.js";

export default class MoviesController {
  static async apiGetMovies(req, res, next) {
    const moviesPerPage = req.query.moviesPerPage
      ? parseInt(req.query.moviesPerPage)
      : 20;

    const page = req.query.page ? parseInt(req.query.page) : 0;

    let filters = {};
    if (req.query.genre) {
      filters.genre = req.query.genre;
    } else if (req.query.title) {
      filters.title = req.query.title;
    }

    const sort = req.query.sort || null;

    const { moviesList, totalMovies } = await MoviesDAO.getMovies({
      filters,
      page,
      moviesPerPage,
      sort,
    });

    let response = {
      moviesList,
      page,
      filters,
      moviesPerPage,
      totalMovies,
    };
    res.json(response);
  }

  static async apiGetMovieById(req, res, next) {
    try {
      let id = req.params.id || {};
      let movie = await MoviesDAO.getMovieById(id);
      if (!movie) {
        res.status(404).json({ error: "Movie not found" });
        return;
      }
      res.json(movie);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e });
    }
  }

  static async apiGetGenres(req, res, next) {
    try {
      let propertyTypes = await MoviesDAO.getGenres();
      res.json(propertyTypes);
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }
}
