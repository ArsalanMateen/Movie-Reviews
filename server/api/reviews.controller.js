import ReviewsDAO from "../dao/reviewsDAO.js";

export default class ReviewsController {
  static async apiPostReview(req, res, next) {
    try {
      const movieId = req.body.movie_id;
      const text = req.body.text || req.body.review;
      const userInfo = {
        name: req.body.name,
        email: req.body.email,
        _id: req.body.user_id,
      };

      const date = new Date();

      await ReviewsDAO.addReview(movieId, userInfo, text, date);
      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiUpdateReview(req, res, next) {
    try {
      const reviewId = req.body.review_id;
      const text = req.body.text || req.body.review;
      const userIdentifier = req.body.email || req.body.user_id;

      const date = new Date();
      const ReviewResponse = await ReviewsDAO.updateReview(
        reviewId,
        userIdentifier,
        text,
        date,
      );

      if (ReviewResponse.modifiedCount === 0) {
        throw new Error(
          "Unable to update review. User may not be original poster",
        );
      }
      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiDeleteReview(req, res, next) {
    try {
      const reviewId = req.body.review_id;
      const userIdentifier = req.body.email || req.body.user_id;

      const ReviewResponse = await ReviewsDAO.deleteReview(
        reviewId,
        userIdentifier,
      );

      if (ReviewResponse.deletedCount === 0) {
        throw new Error(
          "Unable to delete review. User may not be original poster",
        );
      }
      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}

