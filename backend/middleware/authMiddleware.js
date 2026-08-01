const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  // Check Authorization Header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get Token
      token = req.headers.authorization.split(" ")[1];

      // Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Store User ID in Request
      req.user = decoded;

      next();
    } catch (error) {
      return res.status(401).json({
        message: "Not Authorized. Invalid Token",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "No Token. Authorization Denied",
    });
  }
};

module.exports = protect;