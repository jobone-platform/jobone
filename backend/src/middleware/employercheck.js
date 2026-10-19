import jwt from 'jsonwebtoken';
import expressAsyncHandler from 'express-async-handler';
import Employer from '../models/employer.js';

export const protectEmployer = expressAsyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // FACT: We MUST fetch the employer to check if they are frozen
      const employer = await Employer.findById(decoded.employer.id);
      
      if (!employer) {
        return res.status(401).json({ message: 'Not authorized, employer not found' });
      }
      
      // FACT: Operational lock for Employers
      if (employer.isFrozen) {
        return res.status(403).json({ message: 'Account Suspended: Your employer account has been frozen by the administration.' });
      }

      req.employerId = employer._id;
      next(); 
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
});