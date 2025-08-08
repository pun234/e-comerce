import express from "express";
import { CompulsorySign, Adminsign } from "../middlewares/authMiddleware.js";
import {
  forgetPasswordcontrol,
  getAllOrdersController,
  getOrdersController,
  Login,
  orderStatusController,
  Register,
  testControl,
  updateProfileController,
  sendOtpController, 
  verifyOtpController, 
} from "../controllers/authController.js";

const router = express.Router();

// Routes
router.post("/register", Register);
router.post("/login", Login);
router.post("/send-otp", sendOtpController); 
router.post("/verify-otp", verifyOtpController); 
router.post("/forget-password", forgetPasswordcontrol);

// Protected routes
router.get("/test", CompulsorySign, testControl);
router.get("/user-auth", CompulsorySign, (req, res) => {
  res.status(200).send({ ok: true });
});
router.get("/admin-auth", CompulsorySign, Adminsign, (req, res) => {
  res.status(200).send({ ok: true });
});
router.put("/profile", CompulsorySign, updateProfileController);
router.get("/orders", CompulsorySign, getOrdersController);
router.get("/all-orders", CompulsorySign, getAllOrdersController);
router.put("/order-Status/:orderId", CompulsorySign, orderStatusController);

export default router;
