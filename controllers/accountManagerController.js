import AccountManager from "../models/accountManager.js";
import bcryptjs from "bcryptjs";
import jwt from 'jsonwebtoken';

export const createAccountManager = async (req, res) => {
  const { username, name, email, phoneNumber, password } =
    req.body;

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

  // if (!devicePermitted || typeof devicePermitted !== "string") {
  //   return res.status(400).json({ message: "devicePermitted is required" });
  // }

  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);

  // const devicePermittedSalt = await bcryptjs.genSalt(10);
  // const hashedDevicePermittedId = await bcryptjs.hash(
  //   devicePermittedSalt,
  //   devicePermitted
  // );

  try {
    const newAccountManager = await AccountManager.create({
      username,
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      // permittedDevices: [hashedDevicePermittedId],
    });

    return res.status(201).json({
      message: "Account Manager created successfully.",
      accountManager: newAccountManager,
    });
  } catch (error) {
    console.error("Error creating Account Manager:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({
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
    const user = await AccountManager.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "Account manager not found" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const jsonwToken = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "5m",
      }
    );

    res.status(200).json({ user, token: jsonwToken });
  } catch (error) {
    console.error("Error validating user:", error);
    res.status(500).json({ message: "Error validating user", error });
  }
};
