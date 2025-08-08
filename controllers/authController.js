import userModel from "../models/userModel.js";
import { comparePassword, hashPassword, generateOTP, verifyOTP, otpStore } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";
import orderModel from "../models/orderModel.js";
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Send OTP
export const sendOtpController = async (req, res) => {
  const { email } = req.body;
  try {
    const otp = generateOTP(email);
    await resend.emails.send({
      from: "onboarding@resend.dev", 
      to: [email],
      subject: "Your OTP for DoorCart",
      html: `<h1>Your One-Time Password is: ${otp}</h1>`,
    });

    res.status(200).send({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Failed to send OTP", error });
  }
};

// Verify OTP
export const verifyOtpController = async (req, res) => {
  const { email, otp } = req.body;
  if (verifyOTP(email, otp)) {
    res.status(200).send({ success: true, message: "OTP verified successfully" });
  } else {
    res.status(400).send({ success: false, message: "Invalid or expired OTP" });
  }
};

// Register
export const Register = async (req, res) => {
  try {
    const { name, email, password, phone, address, otp,gender } = req.body;

    // Validations
    if (!name || !email || !password || !phone || !address || !otp||!gender) {
      return res.status(400).send({ message: "All fields and OTP are required" });
    }

    if (!verifyOTP(email, otp)) {
      return res.status(400).send({ success: false, message: "Invalid or expired OTP" });
    }

    // Check for existing user
    const existUser = await userModel.findOne({ email });
    if (existUser) {
      return res.status(200).send({
        success: false,
        message: "Already Registered, please login",
      });
    }

    // Register user
    const hashedPassword = await hashPassword(password);
    const user = await new userModel({ name, email, phone, address,gender, password: hashedPassword }).save();
    
    delete otpStore[email];

    res.status(201).send({
      success: true,
      message: "Registration Successful",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registration",
      error,
    });
  }
};

// POST Login
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }
    
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    }
    // Token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "Login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        gender: user.gender,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login",
      error,
    });
  }
};

// Forget password with OTP
export const forgetPasswordcontrol = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    // Validate inputs
    if (!email || !newPassword || !otp) {
      return res.status(400).send({ success: false, message: "All fields are required" });
    }

    // Verify OTP
    if (!verifyOTP(email, otp)) {
      return res.status(400).send({ success: false, message: "Invalid or expired OTP" });
    }

    // Find the user and update password
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    const hashedPassword = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashedPassword });
    
    res.status(200).send({ success: true, message: "Password Reset Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error resetting password", error });
    }
};


export const testControl = (req, res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

export const updateProfileController = async (req, res) => {
  try {
    const { name, password, address, phone,gender} = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
        gender: gender || user.gender,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error While Update profile",
      error,
    });
  }
};

export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Geting Orders",
      error,
    });
  }
};

export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Getting Orders",
      error,
    });
  }
};

// export const orderStatusController = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { status } = req.body;
//     const orders = await orderModel.findByIdAndUpdate(
//       orderId,
//       { status },
//       { new: true }
//     );
//     res.json(orders);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       success: false,
//       message: "Error While Updateing Order",
//       error,
//     });
//   }
// };
export const orderStatusController = async (req, res) => {
  try {
  const { orderId } = req.params;
  const { status } = req.body;
  const updatedOrder = await orderModel.findByIdAndUpdate(
  orderId,
 { status },
     { new: true }
).populate("buyer"); 

  if (!updatedOrder) {
   return res.status(404).send({
     success: false,
     message: "Order not found",
      });
   }

    const statusMap = {
      "Shipped": "Your order has been shipped.",
      "DELIVERED": "Your order has been delivered.",
      "CANCELED": "Your order has been canceled."
    };

    const emailBody = `<h1>Order Status Update</h1>
                      <p>Hello ${updatedOrder.buyer.name},</p>
                      <p>${statusMap[status] || `Your order status has been updated to: <strong>${updatedOrder.status}</strong>`}</p>
                      <p>Thank you for shopping with us!</p>`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
   to: [updatedOrder.buyer.email],
    subject: `Your DoorCart Order #${orderId} has been updated`,
   html: emailBody,
});

   res.status(200).send({
   success: true,
  message: "Order Updated Successfully and email sent",
  order: updatedOrder,
    });
   } catch (error) {
      console.log(error);
      res.status(500).send({
      success: false,
      message: "Error While Updating Order and sending email",
      error,
    });
  }
};
