const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied, no token provided" });
  }
 
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = decoded; // Save user data (id, username) for later use
    next(); // Continue to the next middleware or route
  });
}

module.exports = verifyToken;
