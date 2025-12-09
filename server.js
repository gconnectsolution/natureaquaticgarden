const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer"); // FIXED
const path = require("path");
const { Sequelize, DataTypes, Op } = require("sequelize");

const app = express();
app.use(cors());
app.use(express.json());

// Serve ALL static files (HTML, CSS, JS, images)
app.use(express.static(__dirname));


// ------------------------------
// NODEMAILER FIXED FUNCTION
// ------------------------------
function sendRegistrationEmail(toEmail, fullName) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mailtestings63@gmail.com",
      pass: "xwce zncz rstt bkls" // Gmail App Password
    }
  });

  const mailOptions = {
    from: "mailtestings63@gmail.com",
    to: toEmail,
    subject: "Your Account Has Been Created",
    html: `
      <h2>Welcome to Nature Aquatic Garden</h2>
      <p>Hello <strong>${fullName}</strong>,</p>
      <p>Your account has been successfully created!</p>
      <p>Thank you for joining us.</p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Email error:", error);
    } else {
      console.log("Registration email sent:", info.response);
    }
  });
}

// ======================================================
// 1. Sequelize DB Connection
// ======================================================
const sequelize = new Sequelize(
  "userdatabase",
  "root",
  "Mysql123",
  {
    host: "localhost",
    dialect: "mysql",
    logging: false
  }
);


// ======================================================
// 2. Sequelize User Model
// ======================================================
const User = sequelize.define("User", {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

sequelize.sync()
  .then(() => console.log("User table synced"))
  .catch(err => console.log("Sequelize error:", err));



// ======================================================
// 3. REGISTER API
// ======================================================
app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.json({ success: false, message: "All fields required" });
    }

    const lowerName = fullName.trim().toLowerCase();

    // Check duplicates
    const exists = await User.findOne({
      where: {
        [Op.or]: [
          { fullName: lowerName },
          { email },
          { phone }
        ]
      }
    });

    if (exists) {
      if (exists.fullName === lowerName)
        return res.json({ success: false, message: "Username already exists" });

      if (exists.email === email)
        return res.json({ success: false, message: "Email already exists" });

      if (exists.phone === phone)
        return res.json({ success: false, message: "Phone number already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      fullName: lowerName,
      email,
      phone,
      password: hashed
    });

    // Send email safely (NO .catch()!)
    sendRegistrationEmail(email, fullName);

    res.json({ success: true, message: "Account created successfully!" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Server error" });
  }
});



// ======================================================
// 4. LOGIN API
// ======================================================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { fullName, password } = req.body;

    const lowerName = fullName.trim().toLowerCase();

    const user = await User.findOne({ where: { fullName: lowerName } });

    if (!user)
      return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Incorrect password" });

    const token = jwt.sign(
      { id: user.id, fullName: user.fullName },
      "supersecretkey",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Server error" });
  }
});

// ======================================================
// 5. Serve Pages
// ======================================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "register.html"));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'products.html'));
})

app.get('/productdetails', (req, res) => {
  res.sendFile(path.join(__dirname, 'productdetails.html'));
})

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
})

app.get('/categories', (req, res) => {
  res.sendFile(path.join(__dirname, 'categories.html'));
})

// ======================================================
// 6. Server Start
// ======================================================
app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
