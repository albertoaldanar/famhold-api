import bcryptjs from "bcryptjs";
import FamholdAdmin from "../models/famholdAdmin.js";
import jwt from "jsonwebtoken";

export const createFamholdAdmin = async (req, res) => {
  const { username, name, email, password } = req.body;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ message: 'Username is required and must be a string.' });
  }
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Name is required and must be a string.' });
  }
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required and must be a valid string.' });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Password is required and must be a string.' });
  }

  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);

  try {
    const newFamholdAdmin = await FamholdAdmin.create({
      username,
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: 'Famhold Admin was created successfully.',
      accountManager: newFamholdAdmin,
    });
  } catch (error) {
    console.error('Error creating Famhold Admin:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'A Famhold Admin with this email already exists.' });
    }

    return res.status(500).json({
      message: 'Error creating Famhold Admin.',
      error: error.message,
    });
  }
};

export const validateFamholdAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await FamholdAdmin.findOne({ where: { username } });
    // const allACcountManagers = await FamholdAdmin.findAll();

    // console.log('allACcountManagers', allACcountManagers);

    if (!user) {
      // console.log('User:', user);

      return res.status(404).json({ message: "Famhold Admin not found" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const jsonwToken = jwt.sign({ username: user.username, role: "famholdAdmin" }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });

    res.status(200).json({ user, token: jsonwToken });
  } catch (error) {
    console.error("Error validating user:", error);
    res.status(500).json({ message: "Error validating user", error });
  }
};
