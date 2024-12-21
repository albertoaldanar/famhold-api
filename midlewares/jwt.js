import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import User from "../models/user.js";
import bcryptjs from "bcryptjs";
import AccountManager from "../models/accountManager.js";
import FamholdAdmin from "../models/famholdAdmin.js";
import VFO from "../models/vfo.js";

export const verifyToken = (allowedRoles = []) => async (req, res, next) => {
  let token = req.headers.authorization;
  const { deviceFingerPrint } = req.body;

  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }

  token = token.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { username, userId, role } = decoded;

    req.username = username;
    req.userId = userId;
    req.role = role;

    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      return res
        .status(403)
        .json({ error: "Access forbidden: insufficient permissions" });
    }

    let user;

    if (role === "vfoUser") {
      user = await User.findOne({ where: { id: userId, username } });
    } else if (role === "famholdAdmin") {
      user = await FamholdAdmin.findOne({ where: { id: userId, username } });
    } else if (role === "accountManager") {
      user = await AccountManager.findOne({ where: { id: userId, username } });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (role === "vfoUser") {
      if (!user.isAccountOn) {
        return res
          .status(403)
          .json({ error: "Account temporarily unavailable" });
      }

      const permittedDevices = user.permittedDevices || [];
      const isDevicePermitted = await Promise.all(
        permittedDevices.map((hashedDevice) =>
          bcryptjs.compare(deviceFingerPrint, hashedDevice)
        )
      ).then((results) => results.some((match) => match));

      if (!isDevicePermitted) {
        return res.status(400).json({ error: "Device not permitted" });
      }

      const vfo = await VFO.findByPk(user.vfoId);
      if (!vfo || !vfo.isVfoOn) {
        return res
          .status(403)
          .json({ error: "VFO temporarily unavailable" });
      }
    }

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(400).json({ error: "Invalid token" });
  }
};

export const verifyTemporaryToken = () => (req, res, next) => {
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
