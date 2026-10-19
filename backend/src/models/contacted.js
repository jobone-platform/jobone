import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId}, 
  name: { type: String, required: true }, // name of the person contacting
  email: { type: String, required: true }, // contact email
  communicationType: { 
    type: String, 
    enum: ["feedback", "complaint", "suggestion","inquiry"], 
    required: true 
  },
  message: { type: String, required: true }, // main content of the message
  isRead: { type: Boolean, default: false }, // tracking if admin has viewed it
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;