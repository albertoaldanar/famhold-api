import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import Family from "../models/family.js";
import { sendVerificationCode } from "../midlewares/mfa.js";
import { decryptObject } from "../midlewares/jwt.js";
import { getFamilyData } from "./familyController.js";

const generateRandomPassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const createUser = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    const randomPassword = generateRandomPassword();
    const randomTokenPassword = generateRandomPassword();

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(randomPassword, salt);
    const hashedTokenPassword = await bcryptjs.hash(randomTokenPassword, salt);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: '"Famhold - VFO" <no-reply@famhold.com>',
      to: email,
      subject: "Welcome to Famhold - Your Account Credentials",
      text: `Dear ${name},\n\nYour account has been created successfully. Below are your credentials:\n\n- Password: ${randomPassword}\n- Family Token Reveal Password: ${randomTokenPassword}\n\nPlease keep these credentials secure and do not share them with anyone.\n\nBest regards,\nFamhold Team`,
    };

    const emailResponse = await transporter.sendMail(mailOptions);

    if (!emailResponse || !emailResponse.accepted.includes(email)) {
      console.error("Failed to send email to:", email);
      return res.status(500).json({ message: "Failed to send email. User not created." });
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      familyTokenRevealPassword: hashedTokenPassword,
      phoneNumber,
    });

    res.status(201).json({ status: "201", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const customizeUserCredentials = async (req, res) => {
  try {
    const {
      userId,
      password,
      currentPassword,
      familyTokenRevealPassword,
      currentFamilyTokenRevealPassword,
    } = req.body;

    const validatePassword = (password) => {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{15,})/;
      return passwordRegex.test(password);
    };

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        field: "currentPassword",
        message: "La contraseña actual de usuario no es válida.",
      });
    }

    const isCurrentFamilyTokenValid = await bcryptjs.compare(
      currentFamilyTokenRevealPassword,
      user.familyTokenRevealPassword
    );
    if (!isCurrentFamilyTokenValid) {
      return res.status(400).json({
        field: "currentFamilyTokenRevealPassword",
        message: "La contraseña actual del token familiar no es válida.",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        field: "password",
        message:
          "La nueva contraseña de usuario debe tener al menos 15 caracteres, incluir al menos una letra mayúscula y un carácter especial.",
      });
    }

    if (!validatePassword(familyTokenRevealPassword)) {
      return res.status(400).json({
        field: "familyTokenRevealPassword",
        message:
          "La nueva contraseña del token familiar debe tener al menos 15 caracteres, incluir al menos una letra mayúscula y un carácter especial.",
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    const hashedTokenPassword = await bcryptjs.hash(familyTokenRevealPassword, salt);

    await User.update(
      {
        password: hashedPassword,
        familyTokenRevealPassword: hashedTokenPassword,
      },
      { where: { id: userId } }
    );

    res.status(200).json({ message: "Credenciales actualizadas con éxito." });
  } catch (error) {
    console.error("Error cambiando contraseñas", error);
    res.status(500).json({ message: "Error al actualizar credenciales.", error });
  }
};

export const resetUserPasswords = async (req, res) => {
  try {
    const { userId } = req.body;

    const newPassword = generateRandomPassword();
    const newFamilyTokenPassword = generateRandomPassword();

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);
    const hashedTokenPassword = await bcryptjs.hash(newFamilyTokenPassword, salt);

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.update(
      {
        password: hashedPassword,
        familyTokenRevealPassword: hashedTokenPassword,
      },
      { where: { id: userId } }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: '"Famhold - VFO" <no-reply@famhold.com>',
      to: user.email,
      subject: "Famhold - Password Reset",
      text: `Dear ${user.name},\n\nYour passwords have been reset successfully. Below are your new credentials:\n\n- New Password: ${newPassword}\n- New Family Token Reveal Password: ${newFamilyTokenPassword}\n\nPlease keep these credentials secure and update them as needed.\n\nBest regards,\nFamhold Team`,
    };

    const emailResponse = await transporter.sendMail(mailOptions);

    if (!emailResponse || !emailResponse.accepted.includes(user.email)) {
      console.error("Failed to send email to:", user.email);
      return res.status(500).json({ message: "Failed to send email. Passwords not reset." });
    }

    res.status(200).json({ message: "Passwords reset successfully. Email sent to user." });
  } catch (error) {
    console.error("Error resetting user passwords:", error);
    res.status(500).json({ message: "Error resetting passwords", error });
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
