import express from "express";
import MoviesController from "./movies.controller.js";
import ReviewsController from "./reviews.controller.js";
import UsersController from "./users.controller.js";

const router = express.Router();

router.route("/").get(MoviesController.apiGetMovies);
router.route("/id/:id").get(MoviesController.apiGetMovieById);
router.route("/genres").get(MoviesController.apiGetGenres);

router
  .route("/reviews")
  .post(ReviewsController.apiPostReview)
  .put(ReviewsController.apiUpdateReview)
  .delete(ReviewsController.apiDeleteReview);

router.route("/users/login").post(UsersController.apiLogin);

export default router;
