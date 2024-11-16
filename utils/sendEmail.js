import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for port 465, false for other ports
      auth: {
        user: "8965nova@gmail.com",
        pass: "xccekuapqrfkgsub",
      },
    });
    return await transporter.sendMail(options);
  } catch (error) {
    console.error("Error sending email:", error); // Log the error
    throw error; // Re-throw the error to be caught in the calling function
  }
};
