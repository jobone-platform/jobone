import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
//importing cors module to handle cross-origin requests
import cors from 'cors';

import connectDB from './configs/db.js';
import userRoutes from './routes/userRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import errorHandler from './middleware/errorhandler.js';
import jobsRoutes from './routes/jobsRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import employerRoutes from './routes/employerRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";

connectDB();

const app = express();
app.use(express.json());


// Enable CORS for all routes
app.use(cors());





//---------------------------MAIN-ROUTES---------------------------------------//
//                                                                             //
//User Routes                                                                  //
app.use("/user", userRoutes);                                                  //
//                                                                             //
//Contact Routes                                                               //
app.use("/contact",contactRoutes);                                             //
//                                                                             //
//Jobs Routes                                                                  //
app.use("/jobs",jobsRoutes);                                                   // 
//                                                                             //
app.use("/applications",applicationRoutes);                                    //
//                                                                             //
//Employer Routes                                                              //
app.use("/employer",employerRoutes); 

//AI Routes
app.use("/ai", aiRoutes);

//Images Route
app.use("/images", imageRoutes);
//---------------------------MAIN ROUTES---------------------------------------//





//-----------------------------ERROR HANDLING MIDDLEWARE--------------------------//
// Error handling middleware                                                      //
app.use(errorHandler);                                                            //
//-----------------------------ERROR HANDLING MIDDLEWARE--------------------------//




app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));