import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    photos: Array,
    isPhotoUploaded: {
      type: Boolean,
      default: "false",
    },
    bannerPath: String,
    bannerName: String,
    orderPath: String,
    orderName: String,
    reportPath: String,
    reportName: String,
    committee: [
      {
        id: {
          type: String,
        },
        name: {
          type: String,
        },
      },
    ],
    createdBy: [
      {
        id: {
          type: String,
        },
        name: {
          type: String,
        },
      },
    ],
    isPublished: {
      type: Boolean,
      default: "false",
    },
    isApproved: {
      type: Boolean,
      default: "false",
    },
    isCertificateGenerated: {
      type: Boolean,
      default: "false",
    },
    status: {
      type: Boolean,
      default: "false",
    },
    problemStatements: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    submissions: [
      {
        name: String,
        email: String,
        registrationNumber: String,
        submissionPath: String,
        problemStatementId: mongoose.Schema.Types.ObjectId,
        status: {
          type: String,
          enum: ["Pending", "Approved", "Rejected"],
          default: "Pending",
        },
      },
    ],
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", EventSchema);

export default Event;
