export async function requireAuth(req, res, next) {
  req.user = {
    uid: "demo-user",
    email: "demo@bharatsaathi.ai",
  };

  next();
}