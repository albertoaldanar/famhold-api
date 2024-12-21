import VFO from "../models/vfo";
import Family from "../models/family";
import User from "../models/user";
import { decryptObject } from "../midlewares/jwt";

export const getVfosForAccountManager = async (req, res) => {
  const { accountManagerId } = req.body;

  try {
    const vfos = await VFO.findAll({ where: { accountManagerId } });

    if (!vfos.length) {
      return res
        .status(404)
        .json({ message: "No VFOs found for this account manager" });
    }

    const familyDetails = await Promise.all(
      vfos.map(async (vfo) => {
        const family = await Family.findByPk(vfo.familyId);
        const decryptedFamily = family ? decryptObject(family.dataValues) : {};

        return {
          familyId: family?.id || null,
          familyName: decryptedFamily?.name,
        };
      })
    );

    res.status(200).json({ families: familyDetails });
  } catch (error) {
    console.error("Error retrieving VFOs for account manager:", error);
    res
      .status(500)
      .json({ message: "Error retrieving VFOs for account manager", error });
  }
};

export const getVfoForAccountManager = async (req, res) => {
  const { accountManagerId, familyId } = req.body;

  try {
    const vfo = await VFO.findOne({
      where: { accountManagerId, familyId },
    });

    if (!vfo) {
      return res.status(404).json({
        message: "No VFO found for this account manager and family combination",
      });
    }

    const family = await Family.findByPk(vfo.familyId);
    const decryptedFamily = family ? decryptObject(family.dataValues) : {};
    const familyName = decryptedFamily.name || "Unknown";

    const users = await User.findAll({
      where: { vfoId: vfo.id },
      attributes: ["type", "username", "email"],
    });

    const decryptedUsers = users.map((user) => {
      const decryptedUser = decryptObject(user.dataValues);
      return {
        type: user.type,
        username: decryptedUser.username,
        email: decryptedUser.email,
      };
    });

    const vfoDetails = {
      familyName,
      familyId: vfo.familyId,
      users: decryptedUsers,
      isVfoOn: vfo.isVfoOn,
      vfoId: vfo.id,
    };

    res.status(200).json({ vfo: vfoDetails });
  } catch (error) {
    console.error("Error retrieving VFO for account manager:", error);
    res.status(500).json({
      message: "Error retrieving VFO for account manager",
      error,
    });
  }
};

export const toggleVfoStatus = async (req, res) => {
  const { vfoId, status } = req.body;

  try {
    const vfo = await VFO.findByPk(vfoId);

    if (!vfo) {
      return res.status(404).json({ message: "VFO not found" });
    }

    vfo.isVfoOn = status;
    await vfo.save();

    const statusMessage = status ? "VFO turned on" : "VFO turned off";
    res.status(200).json({ message: statusMessage });
  } catch (error) {
    console.error("Error toggling VFO status:", error);
    res.status(500).json({ message: "Error toggling VFO status", error });
  }
};
