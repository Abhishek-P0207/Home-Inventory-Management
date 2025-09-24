import express from "express";
import AuthCtrl from "./auth.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// console.log("Hello");
// Public routes (no authentication required)
router.route("/register").post(AuthCtrl.apiRegister);
router.route("/login").post(AuthCtrl.apiLogin);

// Protected routes (authentication required)
router.route("/profile")
    .get(authenticateToken, AuthCtrl.apiGetProfile)
    .put(authenticateToken, AuthCtrl.apiUpdateProfile);

router.route("/change-password").put(authenticateToken, AuthCtrl.apiChangePassword);
router.route("/verify-token").get(authenticateToken, AuthCtrl.apiVerifyToken);

export default router;