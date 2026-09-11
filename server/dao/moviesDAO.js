import mongodb from "mongodb";

const ObjectId = mongodb.ObjectId;

let movies;

export default class MoviesDAO {
  static async injectDB(conn) {
    if (movies) {
      return;
    }
    try {
      movies = await conn.db(process.env.MOVIEREVIEWS_NS).collection("movies");
    } catch (e) {
      console.error(
        `Unable to connect to the MongoDB movies collection. Please verify the database name and connection configuration: ${e}`,
      );
    }
  }

  static async getMovies({
    filters = null,
    page = 0,
    moviesPerPage = 20,
    sort = null,
  } = {}) {
    let query;

    if (filters) {
      if (filters.hasOwnProperty("title")) {
        query = { title: { $regex: filters["title"], $options: "i" } };
      } else if (filters.hasOwnProperty("genre")) {
        query = { genres: { $eq: filters["genre"] } };
      }
    }

    const sortOptions = {
      ratingDesc: { "imdb.rating": -1 },
      ratingAsc: { "imdb.rating": 1 },
      yearDesc: { year: -1 },
      yearAsc: { year: 1 },
    };
    const sortOrder = sortOptions[sort] ?? {};

    let cursor;
    try {
      cursor = await movies
        .find(query)
        .sort(sortOrder)
        .limit(moviesPerPage)
        .skip(moviesPerPage * page);

      const [moviesList, totalMovies] = await Promise.all([
        cursor.toArray(),
        movies.countDocuments(query),
      ]);
      return { moviesList, totalMovies };
    } catch (e) {
      console.error(`Unable to retrieve movies from the database: ${e}`);
      return { moviesList: [], totalMovies: 0 };
    }
  }
}
