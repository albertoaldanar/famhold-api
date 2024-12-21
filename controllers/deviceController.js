import NotPermittedDevice from "../models/notPermittedDevice.js";
import PermittedDevice from "../models/permittedDevice.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

export const acceptNotPermittedDevice = async (req, res) => {
  const { userId, deviceId } = req.body;

  try {
    const notPermittedDevice = await NotPermittedDevice.findByPk(deviceId);

    if (!notPermittedDevice) {
      return res.status(404).json({ message: "NotPermittedDevice not found." });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const permittedDevice = await PermittedDevice.create({
      userId,
      deviceFingerPrint: notPermittedDevice.deviceFingerPrint,
      lastLogin: new Date().toISOString(),
      deviceInfo: notPermittedDevice.deviceInfo,
    });

    await notPermittedDevice.destroy();

    const permittedDevices = user.permittedDevices || [];

    permittedDevices.push(notPermittedDevice.deviceFingerPrint);

    await user.update({ permittedDevices });

    return res.status(200).json({
      message: "Device successfully permitted",
      permittedDevice,
    });
  } catch (error) {
    console.error("Error accepting not permitted device:", error);
    return res.status(500).json({ message: "An error occurred.", error });
  }
};

export const validateDeviceAfterCorrectCredentials = async (req, res) => {
  const { username, deviceFingerPrint } = req.body;

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
    return res.status(403).json({
      message:
        "Este dispositivo no tiene permiso para entrar, por favor contacte a su asesor de cuenta para registrarlo.",
    });
  }
  
  let userData;

  const jsonwToken = jwt.sign(
    { username, role: "vfoUser" },
    process.env.JWT_SECRET,
    {
      expiresIn: "5m",
    }
  );

  if (role === "vfoUser") {
    userData = { familyId: user.linkedFamilyMemberId, username, role };
  } else {
    userData = { username, role };
  }

  return res
    .status(200)
    .json({
      message: "Access granted for device",
      token: jsonwToken,
      data: userData,
    });
};
