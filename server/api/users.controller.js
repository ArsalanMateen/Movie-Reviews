import UsersDAO from "../dao/usersDAO.js";

export default class UsersController {
  static async apiLogin(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required." });
      }

      const result = await UsersDAO.login(email.trim().toLowerCase(), password);

      if (result.error) {
        return res.status(401).json({ error: result.error });
      }

      res.json({
        status: "success",
        user: result.user,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}
