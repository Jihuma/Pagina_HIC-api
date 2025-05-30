import express from "express"
import { 
    getAllCategories,
    createCategory,
    deleteCategory
} from "../controllers/category.controller.js"
import { requireAuth } from '@clerk/express'

const router = express.Router()

router.get("/", getAllCategories);
router.post("/", requireAuth(), createCategory);
router.delete("/:id", requireAuth(), deleteCategory);

export default router