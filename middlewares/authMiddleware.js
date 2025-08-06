// import JWT from "jsonwebtoken";
// import userModel from "../models/userModel.js";

// //Protected Routes token base?
// //  requiresign
// export const CompulsorySign = async (req, res, next) => {
//   try {
//     const decode = JWT.verify(
//       req.headers.authorization,
//       process.env.JWT_SECRET
//     );
//     req.user = decode;
//     next();
//   } catch (error) {
//     console.log(error);

//     // chat
//     // res.status(401).send({
//     //   success: false,
//     //   message: "Unauthorized",
//     // });
//   }
// };

// //admin acceess  isAdmin
// export const Adminsign = async (req, res, next) => {
//   try {
//     const user = await userModel.findById(req.user._id);
//     if (user.role !== 1) {
//       return res.status(401).send({
//         // return res.status(403).send({
//         success: false,
//         message: "Access denied. Admins only.",
//       });
//     } 
//       next();
//   } catch (error) {
//     console.log(error);
//     res.status(401).send({
//       // res.status(500).send({  
//     success: false,
//       error,
//       message: "Error in admin middelware",
//     });
//   }
// };
import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Protected Route Middleware: Requires valid JWT
export const CompulsorySign = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// Admin Access Middleware: Allows only users with role === 1
export const Adminsign = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role !== 1) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error in admin middleware.",
      error: error.message,
    });
  }
};
