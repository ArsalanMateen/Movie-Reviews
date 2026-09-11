import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
import MoviesDAO from "./dao/moviesDAO.js";
import ReviewsDAO from "./dao/reviewsDAO.js";
import UsersDAO from "./dao/usersDAO.js";

// ECONNREFUSED error
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

async function main() {
  dotenv.config();
  const client = new mongodb.MongoClient(process.env.MOVIEREVIEWS_DB_URI);
  const port = process.env.PORT || 8000;

  try {
    // connect to the MongoDB cluster
    await client.connect();

    // connect to the database
    await MoviesDAO.injectDB(client);
    await ReviewsDAO.injectDB(client);
    await UsersDAO.injectDB(client);

    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main().catch(console.error);
