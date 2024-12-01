import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import Family from "../models/family.js";
import { sendVerificationCode } from "../midlewares/mfa.js";
import { decryptObject } from "../midlewares/jwt.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    res.status(201).json({ status: "201", user: user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const validateUsers = async (req, res) => {
  const { username, password, familyId, familyToken } = req.body;

  try {
    const family = await Family.findOne({ where: { familyId } });
    if (!family) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    if (family.familyToken !== familyToken) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { success, token, error } = await sendVerificationCode(user.email, user.user, 'vfoUser');

    if (!success) {
      return res.status(500).json({ error });
    }

    res.status(200).json({
      message: "Verification code sent successfully.",
      token,
    });

  } catch (error) {
    console.error("Error validating user:", error);
    res.status(500).json({ message: "Error validating user", error });
  }
};
