import Contact from "../models/contacted.js";
import expressAsyncHandler from "express-async-handler";


import { isValidEmail, validateName, sanitizeString } from "../utils/validators.js";

export const contactUs = expressAsyncHandler(async (req, res) => {
    const { name, email, communicationType, subject, message } = req.body;

    const nameCheck = validateName(name, "Name");
    if (!nameCheck.isValid) {
      res.status(400);
      throw new Error(nameCheck.message);
    }

    if (!isValidEmail(email)) {
      res.status(400);
      throw new Error("A valid email address is required");
    }

    const validTypes = ["feedback", "complaint", "suggestion", "inquiry"];
    let finalType = communicationType;
    if (!finalType || !validTypes.includes(finalType.toLowerCase())) {
      finalType = "inquiry";
    } else {
      finalType = finalType.toLowerCase();
    }

    const sanitizedMsg = sanitizeString(message);
    if (!sanitizedMsg || sanitizedMsg.length < 5) {
      res.status(400);
      throw new Error("Message must be at least 5 characters long");
    }

    const fullMessage = subject && subject.trim() 
      ? `[Subject: ${sanitizeString(subject)}]\n${sanitizedMsg}`
      : sanitizedMsg;

    const newContact = new Contact({
      name: nameCheck.value,
      email: email.trim().toLowerCase(),
      communicationType: finalType,
      message: fullMessage
    });

    await newContact.save();
    res.status(201).json({ message: "Contact message received successfully" });
});

export const getContactmessage = expressAsyncHandler(async (req, res) => {
    const {id} = req.params;
    const contact = await Contact.findById(id);
    if(!contact) return res.status(404).json({message: "Contact message not found"});
    res.status(200).json(contact);

})


