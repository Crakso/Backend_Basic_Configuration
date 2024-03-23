import { Router } from "express";
import { RegisterUser } from "../controllers/users.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router()


router.route('/register',upload.fields()).post(RegisterUser)


export default router;