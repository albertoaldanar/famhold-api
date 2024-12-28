import express from "express";
import {
  getVfosForAccountManager,
  getVfoForAccountManager,
  toggleVfoStatus,
} from "../controllers/vfoController.js";

const router = express.Router();

router.post("vfos/account-manager", getVfosForAccountManager);

router.post("vfo/account-manager", getVfoForAccountManager);

router.post("toggle-status", toggleVfoStatus);

export default router;
