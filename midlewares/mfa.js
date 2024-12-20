import jwt from "jsonwebtoken";
import { format } from 'date-fns';
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import NotPermittedDevice from "../models/notPermittedDevice.js";
import User from "../models/User.js";
import Family from "../models/family.js";

export const sendVerificationCode = async (email, username, role) => {
  const code = Math.floor(100000 + Math.random() * 900000);

  const token = jwt.sign({ code, username, role }, process.env.JWT_SECRET, {
    expiresIn: "2m",
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass:  process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: '"Famhold - VFO" <albertoaldanar@gmail.com>',
    to: email,
    subject: "Codigo de verificación",
    text: `Tu código de verificación es: ${code}`,
  };

  try {
    const response = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", response);

    return { success: true, token };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send verification email." };
  }
};

export const validateCode = async (req, res) => {
  let token = req.headers.authorization;
  const { userCode, deviceFingerPrint, location, deviceInfo } = req.body;

  token = token.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { code, username, role } = decoded;

    if (code === userCode) {
      const user = await User.findOne({ where: { username } });

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const permittedDevices = user.permittedDevices || [];

      const isDevicePermitted = await Promise.all(
        permittedDevices.map((hashedDevice) =>
          bcryptjs.compare(deviceFingerPrint, hashedDevice)
        )
      ).then((results) => results.some((match) => match));

      if (!isDevicePermitted) {
        const lastLoginAttempt = format(new Date(), 'dd/MM/yyyy - HH:mm');
        const hashedDeviceFingerprint = await bcryptjs.hash(deviceFingerPrint, 10);

        const encryptedData = encryptObject(
          {
            location: location || "Unknown",
            deviceInfo: deviceInfo || "Unknown",
            lastLoginAttempt,
          },
          ['userId']
        );

        await NotPermittedDevice.create({
          ...encryptedData,
          deviceFingerprint: hashedDeviceFingerprint,
          userId: user.id,
        });

        const temporaryToken = jwt.sign(
          { deviceFingerPrint, user: user.id },
          process.env.JWT_TEMPORARY_SECRET,
          {
            expiresIn: "2m",
          }
        );

        return res.status(403).json({
          message: "Este dispositivo no tiene permiso para entrar, por favor contacte a su asesor de cuenta para registrarlo.",
          token: temporaryToken,
        });
      }

      let userData;
      const jsonwToken = jwt.sign(
        { username, role },
        process.env.JWT_SECRET,
        {
          expiresIn: "5m",
        }
      );

      if (role === "vfoUser") {
        const family = await Family.findOne({ where: { id: user.vfoId } });

        if (!family) {
          return res.status(404).json({ message: "Family not found for the given VFO ID." });
        }

        userData = {
          familyId: family.id,
          vfoId: user.vfoId,
          username,
          userId: user.id,
          role,
        };
      }

      return res.status(200).json({
        message: "Code validated successfully!",
        token: jsonwToken,
        data: userData,
      });
    } else {
      return res.status(400).json({ message: "Invalid code." });
    }
  } catch (error) {
    console.error("Error validating token:", error);
    return res.status(400).json({ message: "Invalid or expired token." });
  }
};
