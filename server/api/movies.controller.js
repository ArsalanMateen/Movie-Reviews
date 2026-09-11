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
}
