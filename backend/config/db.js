const mongoose = require("mongoose");
const dns = require("dns");

// Use standard public DNS to assist SRV record resolution on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore if restricted
}

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/interview-prep";
  const localFallbackUri = "mongodb://127.0.0.1:27017/interview-prep";

  try {
    await mongoose.connect(primaryUri);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error(`Failed to connect to primary MongoDB URI (${err.message})`);

    if (primaryUri !== localFallbackUri) {
      console.log("Attempting fallback connection to local MongoDB (mongodb://127.0.0.1:27017/interview-prep)...");
      try {
        await mongoose.connect(localFallbackUri);
        console.log("Connected to local MongoDB successfully!");
        return;
      } catch (localErr) {
        console.error("Local MongoDB fallback failed:", localErr.message);
      }
    }

    console.error("Could not establish a database connection. Please check your MONGO_URI in backend/.env.");
    process.exit(1);
  }
};

module.exports = connectDB;
