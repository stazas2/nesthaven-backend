import jwt from "jsonwebtoken"

export default async (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "")

  if (!token) {
    return res
      .status(401)
      .json({ status: "fail", message: "Токен не предоставлен" })
  }

  try {
    const decoded = jwt.verify(token, process.env.secretKey)
    req.userId = decoded._id
    next()
  } catch (err) {
    console.error(err)
    return res.status(403).json({ status: "fail", message: "Нет доступа" })
  }
}
