import bcryptjs from "bcryptjs";
import FamholdAdmin from "../models/famholdAdmin.js";
import { decryptObject, encryptObject } from "../midlewares/jwt.js";
import { sendVerificationCode } from "../midlewares/mfa.js";

export const createFamholdAdmin = async (req, res) => {
  const { username, name, email, password } = req.body;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ message: "Username is required and must be a string." });
  }
  if (!name || typeof name !== "string") {
    return res.status(400).json({ message: "Name is required and must be a string." });
  }
  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required and must be a valid string." });
  }
  if (!password || typeof password !== "string") {
    return res.status(400).json({ message: "Password is required and must be a string." });
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const encryptedBody = encryptObject(req.body, ["password"]);

    const newFamholdAdmin = await FamholdAdmin.create({
      username: encryptedBody.username || username,
      name: encryptedBody.name || name,
      email: encryptedBody.email || email,
      password: hashedPassword
    });

    return res.status(201).json({
      message: "Famhold Admin was created successfully.",
      famholdAdmin: newFamholdAdmin,
    });
  } catch (error) {
    console.error("Error creating Famhold Admin:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "A Famhold Admin with this email already exists.",
      });
    }

    return res.status(500).json({
      message: "Error creating Famhold Admin.",
      error: error.message,
    });
  }
};


export const validateFamholdAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const famholdAdmins = await FamholdAdmin.findAll();

    const matchedAdmin = famholdAdmins.find((admin) => {
      const decryptedAdmin = decryptObject({ username: admin.username });
      return decryptedAdmin.username === username;
    });

    if (!matchedAdmin) {
      return res.status(404).json({ message: "Famhold Admin not found" });
    }

    const isPasswordValid = await bcryptjs.compare(password, matchedAdmin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const decryptedEmail = decryptObject({ email: matchedAdmin.email }).email;

    const { success, token, error } = await sendVerificationCode(decryptedEmail, matchedAdmin.username, 'famholdAdmin');

    if (!success) {
      return res.status(500).json({ error });
    }

    res.status(200).json({
      message: "Verification code sent successfully.",
      token,
    });
  } catch (error) {
    console.error("Error validating Famhold Admin:", error);
    res.status(500).json({ message: "Error validating Famhold Admin", error });
  }
};

export const validateCodeFamholdAdmin = async (req, res) => {
  const { userCode } = req.body;
  let token = req.headers.authorization;

  token = token.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { code, username, role } = decoded;

    if (code === userCode) {
      const famholdAdmin = await FamholdAdmin.findOne({ where: { username } });

      if (!famholdAdmin) {
        return res.status(404).json({ message: "Famhold Admin not found." });
      }

      const jsonwToken = jwt.sign(
        { username, role },
        process.env.JWT_SECRET,
        {
          expiresIn: "5m",
        }
      );

      const userData = {
        adminId: famholdAdmin.id,
        username,
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
    console.error("Error validating code for Famhold Admin:", error);
    return res.status(400).json({ message: "Invalid or expired token." });
  }
};
