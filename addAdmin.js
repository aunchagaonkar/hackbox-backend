import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js"; // Adjust the path if necessary

dotenv.config(); // Load environment variables

const addAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const hashedPassword = await bcrypt.hash("yourpassword", 10); 

    const admin = new Admin({
      email: "admin@example.com", // Replace with the desired email
      password: hashedPassword,
      name: "Admin Name", // Replace with the desired name
      role: "admin",
      committeeName: "Your Committee", // Replace with the desired committee name
      committeeId: "Your Committee ID", // Replace with the desired committee ID
      mobile: "1234567890", // Replace with the desired mobile number
    });

    await admin.save();

    console.log("Admin added successfully");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error adding admin:", error);
    mongoose.connection.close();
  }
};

addAdmin();