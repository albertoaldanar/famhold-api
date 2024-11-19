import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

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
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const jsonwToken = jwt.sign({ username: user.username, role: "vfoUser" }, process.env.JWT_SECRET, {
      expiresIn: "2m",
    });

    res.status(200).json({ user, token: jsonwToken });
  } catch (error) {
    console.error("Error validating user:", error);
    res.status(500).json({ message: "Error validating user", error });
  }
};
