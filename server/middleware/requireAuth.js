const crypto = require("node:crypto");

const requireAuth = (req, res, next) => {
  const authHeader = req.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const secret = process.env.AUTH_TOKEN_SECRET;

  if (!secret || secret.length < 32) {
    return res.status(500).json({ message: "Server authentication is not configured." });
  }

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) {
    return res.status(401).json({ message: "Please log in to continue." });
  }

  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return res.status(401).json({ message: "Your login has expired. Please log in again." });
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!decoded.userId || !Number.isInteger(decoded.expiresAt) || decoded.expiresAt <= Date.now() / 1000) {
      return res.status(401).json({ message: "Your login has expired. Please log in again." });
    }
    req.userId = decoded.userId;
    return next();
  } catch {
    return res.status(401).json({ message: "Please log in to continue." });
  }
};

module.exports = requireAuth;
