import bcrypt from "bcryptjs";

let users;

export default class UsersDAO {
  static async injectDB(conn) {
    if (users) {
      return;
    }
    try {
      users = await conn
        .db(process.env.MOVIEREVIEWS_NS)
        .collection("users");
    } catch (e) {
      console.error(`Unable to connect to users collection: ${e}`);
    }
  }

  static async login(email, password) {
    try {
      if (!users) {
        return { error: "Database connection not initialized" };
      }

      const user = await users.findOne({ email: email });
      if (!user) {
        return { error: "Invalid email or password" };
      }

      if (!user.password) {
        return { error: "User account has no password set" };
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { error: "Invalid email or password" };
      }

      return {
        user: {
          name: user.name || user.email.split("@")[0],
          email: user.email,
        },
      };
    } catch (e) {
      console.error(`Error during user login: ${e}`);
      return { error: e.message };
    }
  }
}
