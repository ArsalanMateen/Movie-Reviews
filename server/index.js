import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";

// ECONNREFUSED error
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

async function main() {
  dotenv.config();
  const client = new mongodb.MongoClient(process.env.MOVIEREVIEWS_DB_URI);
  const port = process.env.PORT || 8000;

  try {
    await client.connect();

    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main().catch(console.error);
