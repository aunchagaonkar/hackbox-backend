import { validationResult } from "express-validator";
import User from "../models/User.js";
import { generateCredentials } from "../utils/generateCredentials.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

export const registerStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      name,
      mobileNo,
      email,
      regNo,
      semester,
      course,
      department,
      event,
      type,
    } = req.body;

    // Check if student already registered for the given event
    const user = await User.find({
      $or: [{ regNo: regNo }, { email: email }],
      event: { $elemMatch: { id: event.id } },
    });

    // Return error if student already registered
    if (user.length > 0) {
      return res
        .status(400)
        .json({ msg: "You Have Already Registered for this event!" });
    }

    // Create new user
    const newUser = new User({
      name,
      regNo,
      phoneNo: mobileNo,
      email,
      semester,
      course,
      department,
      event,
      type,
    });
    const savedUser = await newUser.save();

    // Generate random password
    const { password } = generateCredentials();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Register user as a member
    const newMember = new Admin({
      email,
      password: hashedPassword,
      name,
      role: "member",
      committeeName: "Participant", 
      committeeId: "participant",
      mobile: mobileNo,
    });
    await newMember.save();

    // Send credentials via email
    const mailOptions = {
      from: "Hackbox <teamwizards2004@gmail.com>",
      to: email,
      subject: "Your Event Registration and Member Credentials",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #4CAF50;">Event Registration Confirmation</h2>
          <p>Dear ${name},</p>
          <p>You have been successfully registered for the event <strong>${event.name}</strong>.</p>
          <p><strong>Your Member Credentials:</strong></p>
          <ul>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Password:</strong> ${password}</li>
          </ul>
          <p>Please keep this information secure.</p>
          <p>Best regards,<br/>Team Wizards</p>
        </div>
      `
    };
    await sendEmail(mailOptions);

    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error in registerStudent:", error); // Log the error for debugging
    res.status(500).json({ error: error.message });
  }
};

//@desc     register faculty for an event
//@route    POST /user/registerFaculty
//@access   public
export const registerFaculty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      name,
      mobileNo,
      email,
      employeeId,
      designation,
      department,
      event,
      type,
    } = req.body;

    //check if faculty already registered for the given event
    const user = await User.find({
      $or: [{ employeeId: employeeId }, { email: email }],
      event: { $elemMatch: { id: event.id } },
    });

    //return error if faculty already registered
    if (user.length > 0) {
      return res
        .status(400)
        .json({ msg: "You Have Already Registered for this event!" });
    }

    //create new user
    const newUser = new User({
      name,
      employeeId,
      phoneNo: mobileNo,
      email,
      designation,
      department,
      event,
      type,
    });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//@desc     get user details
//@route    POST /user/getUsers
//@access   private {admin, convenor, member}
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
