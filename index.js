import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDb from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import chatRouter from "./routes/chatRoute.js";
import messageRoute from "./routes/messageRoute.js";
const app = express();


 await connectDb()
// middleware
app.use(cors());
app.use(express.json());

// routes
app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRoute)

app.listen(process.env.PORT, () => {
  console.log(` Server is running port ${process.env.PORT}`);
});
