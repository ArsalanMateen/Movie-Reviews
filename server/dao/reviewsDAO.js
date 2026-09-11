import mongodb from "mongodb";

// to convert the string representation into a MongoDB ObjectId.
const ObjectId = mongodb.ObjectId;
let reviews;

export default class ReviewsDAO {
  static async injectDB(conn) {
    if (reviews) {
      return;
    }
    try {
      reviews = await conn
        .db(process.env.MOVIEREVIEWS_NS)
        .collection("reviews");
    } catch (e) {
      console.error(
        `Unable to connect to the MongoDB reviews collection. Please verify the database name and connection configuration: ${e}`,
      );
    }
  }

  static async addReview(movieId, user, text, date) {
    try {
      const reviewDoc = {
        name: user.name,
        email: user.email,
        movie_id: new ObjectId(movieId),
        text: text,
        date: date,
      };

      if (user._id) {
        reviewDoc.user_id = user._id;
      }

      return await reviews.insertOne(reviewDoc);
    } catch (e) {
      // return an error to be handled in the controller
      console.error(`Unable to post review: ${e}`);
      throw e;
    }
  }

  static async updateReview(reviewId, userIdentifier, text, date) {
    try {
      return await reviews.updateOne(
        {
          _id: new ObjectId(reviewId),
          $or: [
            { email: userIdentifier },
            { user_id: userIdentifier },
          ],
        },
        { $set: { text: text, date: date } },
      );
    } catch (e) {
      console.error(`Unable to update review: ${e}`);
      throw e;
    }
  }

  static async deleteReview(reviewId, userIdentifier) {
    try {
      return await reviews.deleteOne({
        _id: new ObjectId(reviewId),
        $or: [
          { email: userIdentifier },
          { user_id: userIdentifier },
        ],
      });
    } catch (e) {
      console.error(`Unable to delete review: ${e}`);
      throw e;
    }
  }
}
