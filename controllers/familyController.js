import Family from "../models/family.js";
import VFO from "../models/vfo.js";
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
