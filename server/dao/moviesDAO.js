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
      /*
        Check if the filters object has its own property title or rated (not inherited from its prototype).
      */
      if (filters.hasOwnProperty("title")) {
        // $text: mongoDB's text search feature to search for the title in the movies collection.
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

  static async getMovieById(id) {
    try {
      return await movies
        .aggregate([
          {
            $match: {
              _id: new ObjectId(id),
            },
          },
          {
            /*
              $lookup:
               {
                 from: <collection to join>,
                 localField: <field from the input document>,
                 foreignField: <field from the documents of the "from" collection>,
                 as: <output array field>
                }
            */

            // return the specific movie with the reviews in an array
            $lookup: {
              from: "reviews",
              localField: "_id",
              foreignField: "movie_id",
              as: "reviews",
            },
          },
        ])
        .next();
    } catch (e) {
      console.error(
        `Unable to retrieve movie with id: "${id}" from the database: ${e}`,
      );
      throw e;
    }
  }

  static async getGenres() {
    try {
      const genres = await movies.distinct("genres");
      return genres.filter(Boolean).sort();
    } catch (e) {
      console.error(`Unable to retrieve movie genres from the database: ${e}`);
      throw e;
    }
  }
}
