import express from "express";
import { Adminsign, CompulsorySign } from "../middlewares/authMiddleware.js";
import {
  categoryControlller,
  createCategoryController,
  deleteCategoryCOntroller,
  singleCategoryController,
  updateCategoryController,
} from "../controllers/categoryController.js";

const router = express.Router();

//routes
// create category
router.post(
  "/create-category",
  CompulsorySign,
  Adminsign,
  createCategoryController
);

//update category
router.put(
  "/update-category/:id",
  CompulsorySign,
  Adminsign,
  updateCategoryController
);

//getALl category
router.get("/get-category", categoryControlller);

//single category
router.get("/single-category/:slug", singleCategoryController);

//delete category
router.delete(
  "/delete-category/:id",
  CompulsorySign,
  Adminsign,
  deleteCategoryCOntroller
);

export default router;