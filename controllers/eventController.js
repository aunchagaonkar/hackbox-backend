import fs from "fs";
import moment from "moment";

import Admin from "../models/Admin.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateCertificate } from "../utils/generateCertificate.js";
import { validationResult } from "express-validator";

//@desc     create a new Event
//@route    POST /event/createEvent
//@access   private {convenor, member}
export const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //get files from req.files
    const { banner, order } = req.files;
    const bannerName = banner[0].filename;
    const bannerPath = banner[0].path;
    const orderName = order[0].filename;
    const orderPath = order[0].path;
    //get rest of event details form req.body
    const {
      name,
      venue,
      startDate,
      endDate,
      description,
      committee,
      createdBy,
    } = req.body;
    //parse committee and creator details
    const parsedCommittee = JSON.parse(committee);
    const parsedCreator = JSON.parse(createdBy);
    // save data to db
    const newEvent = new Event({
      name,
      venue,
      startDate,
      endDate,
      description,
      bannerName,
      bannerPath,
      orderName,
      orderPath,
      committee: parsedCommittee,
      createdBy: parsedCreator,
    });
    const savedEvent = await newEvent.save();
    const committeeId = parsedCommittee.id;
    const convenor = await Admin.findOne({ committeeId }).select("email");
    const admin = await Admin.findOne({ role: "admin" }).select("email");
    const convenorMailOptions = {
      from: "Hackbox <Hackboxsp@gmail.com>",
      to: convenor.email,
      subject: `New Event Created - ${name}`,
      text: `Hi,\n\nA new event has been created.\n\nEvent Name: ${name}.\nCreated By: ${parsedCreator.name}.\n\nPlease Login to review the event under Unapproved Events Section.\nRegards Team Hackbox.`,
    };
    sendEmail(convenorMailOptions);

    const adminMailOptions = {
      from: "Hackbox <Hackboxsp@gmail.com>",
      to: admin.email,
      subject: `New Event Created - ${name}`,
      text: `Hi,\n\nA new event has been created.\n\nEvent Name: ${name}.\nCreated By: ${parsedCreator.name}.\n\nPlease Login to review or Approve the event under Approve Events Section.\nRegards Team Hackbox.`,
    };
    sendEmail(adminMailOptions);

    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@desc     upload report of an Event
//@route    POST /event/uploadReport
//@access   private {convenor, member}
export const uploadReport = async (req, res) => {
  try {
    //get file from req.file
    const report = req.file;
    const reportName = report.filename;
    const reportPath = report.path;
    //get id of event  form req.body
    const { id } = req.body;
    //update event
    const filter = { _id: id };
    const update = { reportName, reportPath, status: true };
    const updatedEvent = await Event.findOneAndUpdate(filter, update, {
      new: true,
    });
    //send success response
    res.status(201).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@desc     upload photos of an Event
//@route    POST /event/uploadPhotos
//@access   private {convenor, member}
export const uploadPhotos = async (req, res) => {
  try {
    const uploadedPhotos = req.files;
    const photosArray = [];
    uploadedPhotos.forEach((photo) => {
      const compressedPath = photo.path.replace("photos", "compressedPhotos");
      const compressedFilename = photo.filename.replace(
        "photos",
        "compressedPhotos"
      );
      photosArray.push({
        filename: compressedFilename,
        path: compressedPath,
      });
    });
    const { id } = req.body;
    //update event
    const filter = { _id: id };
    const update = { photos: photosArray, isPhotoUploaded: true };
    const updatedEvent = await Event.findOneAndUpdate(filter, update, {
      new: true,
    });
    //send success response
    res.status(201).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@desc     get a single event
//@route    POST /events/getEvent
//@access   public
export const getEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findOne({ _id: eventId });
    if (!event) return res.status(404).json({ msg: "No Event Found " });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@desc     get a list of all unApproved events
//@route    GET /events/unapprovedEvents
//@access   private {admin}
export const getUnApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ isApproved: "false" });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@desc     get a list of all unApproved events of a committee
//@route    POST /events/committeeUnapprovedEvents
//@access   private {convenor, member}
export const getCommitteeUnApprovedEvents = async (req, res) => {
  try {
    const { committeeId } = req.body;
    const events = await Event.find({
      isApproved: false,
      "committee.id": committeeId,
    });
    const sortedEvents = events.sort(
      (a, b) => moment(new Date(b.startDate)) - moment(new Date(a.startDate))
    );
    if (!events) res.status(401).json({ error: "No Events found" });
    res.status(200).json(sortedEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@desc     get a list of all published events
//@route    GET /events/publishedEvents
//@access   public
export const getPublishedEvents = async (req, res) => {
  try {
    const events = await Event.find({ isPublished: "true" });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@desc     get a list of all approved events
//@route    GET /events/approvedEvents
//@access   private {admin}
export const getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ isApproved: true });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@desc     get a list of all approved events of a committee
//@route    POST /events/committeeApprovedEvents
//@access   private {convenor, member}
export const getCommitteeApprovedEvents = async (req, res) => {
  try {
    const { committeeId } = req.body;
    const events = await Event.find({
      isApproved: true,
      "committee.id": committeeId,
    });
    const sortedEvents = events.sort(
      (a, b) => moment(new Date(b.startDate)) - moment(new Date(a.startDate))
    );
    if (!events) res.status(401).json({ error: "No Events found" });
    res.status(200).json(sortedEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@desc     approve an event
//@route    POST /events/approveEvent
//@access   private {admin}
export const approveEvent = async (req, res) => {
  try {
    const { id } = req.body;
    const filter = { _id: id };
    const update = { isPublished: "true", isApproved: "true" };
    const publishedEvent = await Event.findOneAndUpdate(filter, update, {
      new: true,
    });
    res.status(201).json(publishedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@desc     toggle whether an event should be published or not
//@route    POST /events/togglePublish
//@access   private {admin}
export const togglePublish = async (req, res) => {
  try {
    const { id, isPublished } = req.body;
    const filter = { _id: id };
    const update = { isPublished: !isPublished };
    const updatedEvent = await Event.findOneAndUpdate(filter, update, {
      new: true,
    });
    res.status(201).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@desc     delete an events
//@route    POST /events/deleteEvent
//@access   private {admin}
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    // Fetch the event before deleting it to access the file paths
    const event = await Event.findById(eventId);
    const deletedEvent = await Event.deleteOne({ _id: eventId });
    if (deletedEvent) {
      // Delete associated files from local storage
      if (event.bannerPath) {
        fs.unlinkSync(event.bannerPath);
      }
      if (event.orderPath) {
        fs.unlinkSync(event.orderPath);
      }
      if (event.reportPath) {
        fs.unlinkSync(event.reportPath);
      }
      if (event.photos) {
        event.photos.forEach((photo) => {
          fs.unlinkSync(photo.path);
        });
      }
      await User.deleteMany({ "event.id": eventId });
      res.status(201).json({ msg: "Deleted Successfully" });
    } else {
      res.status(500).json({ error: error.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@desc     send certificates of an event
//@route    POST /events/sendCertificate
//@access   private {admin, convenor, member}
export const sendCertificate = async (req, res) => {
  try {
    const { id, eventDate } = req.body;

    try {
      const users = await User.find({ "event.id": id });
      for (const user of users) {
        const certificate = await generateCertificate(
          user.name,
          user.event[0].name,
          eventDate
        );

        if (user.email) {
          const mailOptions = {
            from: "Hackbox <Hackboxsp@gmail.com>",
            to: user.email,
            subject: `Event Certificate - ${user.event[0].name}`,
            text: `Dear ${user.name},\n\nThank You!\nFor attending the event "${user.event[0].name}". Attached to this email is your certificate.\n\nBest regards,\nTeam Hackbox .`,
            attachments: [
              {
                filename: `${user.name.split(" ")[0]}_certificate.pdf`,
                content: certificate,
              },
            ],
          };
          sendEmail(mailOptions);
        }
      }
      const filter = { _id: id };
      const update = { isCertificateGenerated: "true" };
      const updatedEvent = await Event.findOneAndUpdate(filter, update, {
        new: true,
      });
      if (updatedEvent) {
        res.status(200).json({ msg: "Certificates Sent" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Added by ameya
//@desc     Add problem statement to an event
//@route    POST /api/events/addProblemStatement
//@access   Private (convenor)
export const addProblemStatement = async (req, res) => {
  try {
    const { eventId, title, description } = req.body;
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (!event.problemStatements) {
      event.problemStatements = [];
    }

    event.problemStatements.push({ title, description });
    await event.save();
    
    res.status(200).json({ message: "Problem statement added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//@desc     Get problem statements for an event
//@route    GET /api/events/:eventId/problemStatements
//@access   Private (convenor)
export const getProblemStatements = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json({ problemStatements: event.problemStatements });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Add a submission
export const addSubmission = async (req, res) => {
  try {
    const { eventId, problemStatementId, name, email, registrationNumber } = req.body;
    const submission = req.file;

    if (!submission) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    event.submissions.push({
      name,
      email,
      registrationNumber,
      submissionPath: submission.path,
      problemStatementId,
    });

    await event.save();
    res.status(201).json({ message: "Submission added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// View submissions for a problem statement
export const viewSubmissions = async (req, res) => {
  try {
    const { eventId, problemStatementId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const submissions = event.submissions.filter(
      (submission) => submission.problemStatementId.toString() === problemStatementId
    );

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Evaluate a submission
export const evaluateSubmission = async (req, res) => {
  try {
    const { eventId, submissionId, status } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const submission = event.submissions.id(submissionId);
    if (!submission) return res.status(404).json({ error: "Submission not found" });

    submission.status = status;
    await event.save();

    res.status(200).json({ message: "Submission evaluated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllSubmissions = async (req, res) => {
  try {
    // Fetch all events with their submissions
    const events = await Event.find({}, 'name submissions').exec();

    // Aggregate all submissions with event details
    const allSubmissions = events.reduce((acc, event) => {
      const eventSubmissions = event.submissions.map(submission => ({
        ...submission.toObject(),
        eventId: event._id,
        eventName: event.name,
      }));
      return acc.concat(eventSubmissions);
    }, []);

    res.status(200).json(allSubmissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = req.file;

    if (!submission) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const event = await Event.findOne({ "submissions._id": submissionId });
    if (!event) return res.status(404).json({ error: "Submission not found" });

    const submissionToUpdate = event.submissions.id(submissionId);
    submissionToUpdate.submissionPath = submission.path;

    await event.save();
    res.status(200).json({ message: "Submission updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProblemStatementById = async (req, res) => {
  try {
    const { problemStatementId } = req.params;
    const events = await Event.find({ "problemStatements._id": problemStatementId });

    if (!events || events.length === 0) {
      return res.status(404).json({ error: "Problem statement not found" });
    }

    // Find the problem statement within the events
    let problemStatement;
    for (const event of events) {
      problemStatement = event.problemStatements.id(problemStatementId);
      if (problemStatement) break;
    }

    if (!problemStatement) {
      return res.status(404).json({ error: "Problem statement not found" });
    }

    res.status(200).json(problemStatement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
