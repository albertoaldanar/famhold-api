import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
/**
 * Encrypts the values of an object except for specified keys.
 *
 * @param {Object} data - The object to be processed.
 * @param {Array} excludeKeys - Array of keys to exclude from encryption.
 * @returns {Object} - A new object with encrypted and unencrypted values.
 */

export const verifyToken =(allowedRoles = []) => (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }

    token = token.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.username = decoded.username;
      req.role = decoded.role;

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.role)) {
        return res
          .status(403)
          .json({ error: "Access forbidden: insufficient permissions" });
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(400).json({ error: "Invalid token" });
    }
};

export const verifyTemporaryToken =() => (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }

  token = token.split(" ")[1];

  try {
    jwt.verify(token, process.env.JWT_TEMPORARY_SECRET);

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(400).json({ error: "Invalid token" });
  }
};

export const encryptObject = (data, excludeKeys = []) => {
  const encryptedObject = {};

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (excludeKeys.includes(key)) {
        encryptedObject[key] = data[key];
      } else {
        encryptedObject[key] = CryptoJS.AES.encrypt(
          data[key],
          process.env.ENCRYPT_SECRET
        ).toString();
      }
    }
  }

  return encryptedObject;
};

export const decryptObject = (data) => {
  const decryptedObject = {};

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      try {
        const decryptedBytes = CryptoJS.AES.decrypt(
          data[key],
          process.env.ENCRYPT_SECRET
        );
        const decryptedValue = decryptedBytes.toString(CryptoJS.enc.Utf8);

        if (decryptedValue) {
          decryptedObject[key] = decryptedValue;
        } else {
          decryptedObject[key] = data[key];
        }
      } catch (error) {
        decryptedObject[key] = data[key];
      }
    }
  }

  return decryptedObject;
};
