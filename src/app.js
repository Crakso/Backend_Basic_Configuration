import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_URL,
    credentials: true
}))


app.use(cookieParser())
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static('public'))




// For professional bases we should declare the routers here.

import userRegisteration from './routes/users.routes.js'
import { upload } from './middlewares/multer.middlewares.js';

app.use('/api/v1/users',upload.fields([{name: "avatar", maxCount: 1},{name: "coverImage", maxCount: 1}]),userRegisteration);





export {app}