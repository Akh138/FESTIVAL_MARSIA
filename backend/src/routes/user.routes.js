import express from "express";
import {
    getAllUsers,
    getUserById,
    register
} from "../controllers/user.controller.js";


const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/register", register);


export default router;
