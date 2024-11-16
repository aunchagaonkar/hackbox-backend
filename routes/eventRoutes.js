import express from "express";
import {
  getUnApprovedEvents,
  deleteEvent,
  togglePublish,
  approveEvent,
  getPublishedEvents,
  getApprovedEvents,
  sendCertificate,
  getCommitteeUnApprovedEvents,
  getCommitteeApprovedEvents,
  getEvent,
  addProblemStatement,
  getProblemStatements,
  addSubmission,
  viewSubmissions,
  evaluateSubmission,
  getAllSubmissions,
  updateSubmission,
  getProblemStatementById,
} from "../controllers/eventController.js";
import { checkRole } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
const router = express.Router();

router.get("/unapprovedEvents", checkRole(["admin"]), getUnApprovedEvents);
router.post(
  "/committeeUnapprovedEvents",
  checkRole(["convenor", "member"]),
  getCommitteeUnApprovedEvents
);
router.get("/approvedEvents", checkRole(["admin", "member", "convenor"]), getApprovedEvents);
router.post("/getEvent", getEvent);
router.post(
  "/committeeApprovedEvents",
  checkRole(["convenor", "member"]),
  getCommitteeApprovedEvents
);
router.post("/approveEvent", checkRole(["admin"]), approveEvent);
router.get("/publishedEvents", getPublishedEvents);
router.post("/togglePublish", checkRole(["admin"]), togglePublish);
router.post("/deleteEvent", checkRole(["admin"]), deleteEvent);
router.post(
  "/sendCertificate",
  checkRole(["admin", "member", "convenor"]),
  sendCertificate
);
// added by ameya
router.post("/addProblemStatement", checkRole(["convenor"]), addProblemStatement);
router.get("/:eventId/problemStatements", checkRole(["convenor", "member"]), getProblemStatements);
router.post("/addSubmission", checkRole(["member"]), upload.single("submission"), addSubmission);
router.get("/:eventId/:problemStatementId/submissions", checkRole(["convenor"]), viewSubmissions);
router.post("/evaluateSubmission", checkRole(["convenor"]), evaluateSubmission);
router.get("/allSubmissions", checkRole(["admin", "convenor", "member"]), getAllSubmissions);
router.post("/updateSubmission/:submissionId", checkRole(["admin", "convenor", "member"]), upload.single("submission"), updateSubmission);
router.get("/problemStatements/:problemStatementId", checkRole(["convenor", "member"]), getProblemStatementById);
export default router;
