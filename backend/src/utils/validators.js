import crypto from 'crypto';

/**
 * Shared validation utilities for JobOne Backend
 */

export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim();
};

export const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
};

export const generateSecureOTP = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length);
  return crypto.randomInt(min, max).toString();
};

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = normalizeEmail(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) && trimmed.length <= 100;
};

export const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.trim().length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  if (password.length > 128) {
    return { isValid: false, message: 'Password cannot exceed 128 characters' };
  }
  return { isValid: true };
};

export const validatePhone = (rawPhone, countryCode = '+91') => {
  if (!rawPhone || typeof rawPhone !== 'string' || !rawPhone.trim()) {
    return { isValid: false, message: 'Phone number is required' };
  }

  const trimmed = rawPhone.trim();
  const cCode = (countryCode || '+91').trim();

  // If the phone number includes country code at start, separate them
  let digitsOnly = trimmed;
  if (digitsOnly.startsWith('+')) {
    // If it starts with the specified country code
    if (digitsOnly.startsWith(cCode)) {
      digitsOnly = digitsOnly.slice(cCode.length).trim();
    } else if (digitsOnly.startsWith('+91')) {
      digitsOnly = digitsOnly.slice(3).trim();
    }
  }

  // Check for invalid characters (letters or special symbols in digit part)
  if (!/^\d+$/.test(digitsOnly)) {
    return {
      isValid: false,
      message: 'Phone number must contain only numbers. Letters and special characters are not allowed.'
    };
  }

  // Indian numbers: exactly 10 digits
  if (cCode === '+91' || trimmed.startsWith('+91')) {
    if (digitsOnly.length !== 10) {
      return {
        isValid: false,
        message: `Indian mobile number must be exactly 10 digits. Entered: ${digitsOnly.length} digits.`
      };
    }
    // Must start with 6, 7, 8, or 9 for valid Indian mobile
    if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
      return {
        isValid: false,
        message: 'Invalid Indian mobile number. It must start with 6, 7, 8, or 9.'
      };
    }
  } else {
    // International numbers: 7 to 15 digits
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return {
        isValid: false,
        message: `Mobile number must be between 7 and 15 digits. Entered: ${digitsOnly.length} digits.`
      };
    }
  }

  // Return formatted phone
  return {
    isValid: true,
    digits: digitsOnly,
    formatted: `${cCode}${digitsOnly}`,
    rawDigits: digitsOnly
  };
};

export const validateName = (name, fieldName = 'Name') => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 characters long` };
  }
  if (trimmed.length > 80) {
    return { isValid: false, message: `${fieldName} cannot exceed 80 characters` };
  }
  if (/^[\d\s!@#$%^&*()_+=[\]{};:"\\|,.<>/?]+$/.test(trimmed)) {
    return { isValid: false, message: `${fieldName} must contain valid alphabetic characters` };
  }
  return { isValid: true, value: trimmed };
};

/**
 * Escapes regex characters to prevent ReDoS and regex injection attacks
 */
export const escapeRegex = (string) => {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validates, trims, and bounds search query input
 */
export const sanitizeSearchString = (str, maxLength = 80) => {
  if (typeof str !== 'string') return '';
  const cleaned = str.trim().slice(0, maxLength);
  return escapeRegex(cleaned);
};

/**
 * Bounds pagination parameters to safe defaults
 */
export const clampPagination = (page, limit, defaultLimit = 10, maxLimit = 50) => {
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const rawLimit = parseInt(limit, 10) || defaultLimit;
  const parsedLimit = Math.min(Math.max(rawLimit, 1), maxLimit);
  const skip = (parsedPage - 1) * parsedLimit;
  return { page: parsedPage, limit: parsedLimit, skip };
};

