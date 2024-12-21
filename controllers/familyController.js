import Family from "../models/family.js";
import VFO from "../models/vfo.js";
import User from "../models/user.js";
import { encryptObject, decryptObject } from "../midlewares/jwt.js";

export const createFamily = async (req, res) => {
  const { name, accountManagerId } = req.body;

  if (!name || typeof name !== "string") {
    return res
      .status(400)
      .json({ message: "Family name is required and must be a string." });
  }

  if (!accountManagerId || typeof accountManagerId !== "number") {
    return res
      .status(400)
      .json({
        message: "Account Manager ID is required and must be a number.",
      });
  }

  const familyId = `fam_${name.toLowerCase().replace(/\s+/g, "_")}_vfo`;

  const familyToken = Array.from({ length: 10 }, () =>
    Math.random()
      .toString(36)
      .charAt(2 + Math.floor(Math.random() * 34))
  ).join("");

  try {
    const encryptedPayload = encryptObject({ name, familyId, familyToken });

    const newFamily = await Family.create(encryptedPayload);

    if (!newFamily) {
      return res.status(500).json({ message: "Failed to create family." });
    }

    const newVFO = await VFO.create({
      familyId: newFamily.id,
      accountManagerId,
      isVFoOn: true,
    });

    if (!newVFO) {
      return res.status(500).json({ message: "Failed to create VFO." });
    }

    return res.status(201).json({
      message: "Family and VFO have been created successfully.",
      family: newFamily,
      vfo: newVFO,
    });
  } catch (error) {
    console.error("Error creating family and VFO:", error);
    return res
      .status(500)
      .json({ message: "Error creating family and VFO.", error });
  }
};

export const getFamilyData = async (req, res) => {
  const { id } = req.params;

  try {
    const family = await Family.findByPk(id);

    if (!family) {
      return res.status(404).json({ message: "Family not found" });
    }

    const decryptedFamily = decryptObject(family.dataValues);

    res.status(200).json({ decryptedResponse: decryptedFamily });
  } catch (error) {
    console.error("Error retrieving family data:", error);
    res.status(500).json({ message: "Error retrieving family data", error });
  }
};

export const revealFamilyToken = async (req, res) => {
  const { tokenRevealPassword, username } = req.body;

  try {
    if (!tokenRevealPassword || !username) {
      return res.status(400).json({ message: "Missing tokenRevealPassword or username" });
    }
    const users = await User.findAll();

    const matchedUser = users.find((user) => {
      const decryptedUser = decryptObject({ username: user.username });
      return decryptedUser.username === username;
    });

    if (!matchedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const decryptedUser = decryptObject(matchedUser.dataValues);

    if (tokenRevealPassword !== decryptedUser.familyTokenRevealPassword) {
      return res.status(400).json({ message: "Incorrect credentials" });
    }
    
    const vfo = await VFO.findByPk(matchedUser.vfoId);

    if (!vfo) {
      return res.status(404).json({ message: "VFO not found for this user" });
    }

    const family = await Family.findByPk(vfo.familyId);

    if (!family) {
      return res.status(404).json({ message: "Family not found for this VFO" });
    }

    const decryptedFamily = decryptObject(family.dataValues);

    res.status(200).json({ familyToken: decryptedFamily.familyToken });
  } catch (error) {
    console.error("Error revealing family token:", error);
    res.status(500).json({ message: "Error revealing family token", error });
  }
};

export const regenerateFamilyToken = async (req, res) => {
  const { familyId } = req.body;

  try {
    if (!familyId) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const family = await Family.findByPk(familyId);

    if (!family) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    const familyToken = Array.from({ length: 10 }, () =>
      Math.random()
        .toString(36)
        .charAt(2 + Math.floor(Math.random() * 34))
    ).join("");

    const encryptedToken = encryptObject({ familyToken });

    family.familyToken = encryptedToken.familyToken;
    await family.save();

    res.status(200).json({ message: "Family token regenerated successfully" });
  } catch (error) {
    console.error("Error regenerating family token:", error);
    res.status(500).json({ message: "Error regenerating family token", error });
  }
};
