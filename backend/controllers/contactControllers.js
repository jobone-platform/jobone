import Contact from "../models/contacted.js";
import expressAsyncHandler from "express-async-handler";


export const contactUs = expressAsyncHandler(async (req, res) => {
    const {name,email,communicationType,message} = req.body;
    const newContact = new Contact({name,email,communicationType,message});
    await newContact.save();
    res.status(201).json({ message: "Contact message received successfully" });
});

export const getContactmessage = expressAsyncHandler(async (req, res) => {
    const {id} = req.params;
    const contact = await Contact.findById(id);
    if(!contact) return res.status(404).json({message: "Contact message not found"});
    res.status(200).json(contact);

})


