import AccountManager from "../models/accountManager.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationCode } from "../midlewares/mfa.js";
import { encryptObject, decryptObject } from "../midlewares/jwt.js";

export const createAccountManager = async (req, res) => {
  const { username, name, email, phoneNumber, password } = req.body;

  if (!username || typeof username !== "string") {
    return res
      .status(400)
      .json({ message: "Username is required and must be a string." });
  }
  if (!name || typeof name !== "string") {
    return res
      .status(400)
      .json({ message: "Name is required and must be a string." });
  }
  if (!email || typeof email !== "string") {
    return res
      .status(400)
      .json({ message: "Email is required and must be a valid string." });
  }
  if (!password || typeof password !== "string") {
    return res
      .status(400)
      .json({ message: "Password is required and must be a string." });
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const encryptedBody = encryptObject(req.body, ["password"]);

    const newAccountManager = await AccountManager.create({
      username: encryptedBody.username || username,
      name: encryptedBody.name || name,
      email: encryptedBody.email || email,
      phoneNumber: encryptedBody.phoneNumber || phoneNumber,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Account Manager created successfully.",
      accountManager: newAccountManager,
    });
  } catch (error) {
    console.error("Error creating Account Manager:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "An Account Manager with this email already exists.",
      });
    }

    return res.status(500).json({
      message: "Error creating Account Manager.",
      error: error.message,
    });
  }
};

export const validateAccountManager = async (req, res) => {
  const { username, password } = req.body;

  try {
    const accountManagers = await AccountManager.findAll();

    const matchedAccountManager = accountManagers.find((manager) => {
      const decryptedManager = decryptObject({ username: manager.username });
      return decryptedManager.username === username;
    });

    if (!matchedAccountManager) {
      return res.status(404).json({ message: "Account manager not found" });
    }

    const isPasswordValid = await bcryptjs.compare(password, matchedAccountManager.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const decryptedEmail = decryptObject({ email: matchedAccountManager.email }).email;

    const { success, token, error } = await sendVerificationCode(
      decryptedEmail,
      matchedAccountManager.username,
      'accountManager'
    );

    if (!success) {
      return res.status(500).json({ error });
    }

    res.status(200).json({
      message: "Verification code sent successfully.",
      token,
    });
  } catch (error) {
    console.error("Error validating account manager:", error);
    res.status(500).json({ message: "Error validating account manager", error });
  }
};

export const validateCodeAccountManager = async (req, res) => {
  const { userCode } = req.body;
  let token = req.headers.authorization;

  token = token.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { code, username, role } = decoded;

    if (code === userCode) {
      const accountManager = await AccountManager.findOne({ where: { username } });

      if (!accountManager) {
        return res.status(404).json({ message: "Account Manager not found." });
      }

      const jsonwToken = jwt.sign(
        { username, role, useId: accountManager.id },
        process.env.JWT_SECRET,
        {
          expiresIn: "5m",
        }
      );
      const usernameDecrypted = decryptObject({ username: manager.username }).username;

      const userData = {
        accountManagerId: accountManager.id,
        username: usernameDecrypted,
        role,
      };

      return res.status(200).json({
        message: "Code validated successfully!",
        token: jsonwToken,
        data: userData,
      });
    } else {
      return res.status(400).json({ message: "Invalid code." });
    }
  } catch (error) {
    console.error("Error validating code for Account Manager:", error);
    return res.status(400).json({ message: "Invalid or expired token." });
  }
};
