// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
//   {
//     products: [
//       {
//         type: mongoose.ObjectId,
//         ref: "Products", // ensure this matches your actual Product model name
//       },
//     ],
//     payment: {},
//     buyer: {
//       type: mongoose.ObjectId,
//       ref: "users", // ensure this matches your actual User model name
//     },
//     status: {
//       type: String,
//       default: "NOT PROCESS",
//       enum: ["NOT PROCESS", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"],
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Order", orderSchema);
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.ObjectId,
        ref: "Products",
      },
    ],
    payment: {},
    buyer: {
      type: mongoose.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      default: "Not Process",
      enum: ["Not Process", "Processing", "Shipped", "deliverd", "cancel"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);