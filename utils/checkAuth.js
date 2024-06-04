import jwt from "jsonwebtoken"
import { UserModel } from "../models/index.js";

export const checkAuth = {
  mandatory: async (req, res, next) => {
      const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

      if (!token) {
          return res.status(401).json({ status: "fail", message: "Пользователь не авторизован. Токен не предоставлен." });
      }

      try {
          const decoded = jwt.verify(token, process.env.secretKey);
          req.userId = decoded._id;
          req.user = await UserModel.findById(req.userId);
          if (!req.user) {
              return res.status(401).json({ status: "fail", message: "Пользователь не найден." });
          }
          next();
      } catch (err) {
          console.error(err);
          return res.status(403).json({ status: "fail", message: "Нет доступа" });
      }
  },
  optional: async (req, res, next) => {
      const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

      if (token) {
          try {
              const decoded = jwt.verify(token, process.env.secretKey);
              req.userId = decoded._id;
              req.user = await UserModel.findById(req.userId);
          } catch (err) {
              // Игнорируем ошибку, если токен недействителен или истек
              console.error("Неверный или истекший токен", err);
          }
      }
      next();
  },
};
