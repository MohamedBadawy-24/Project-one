import express from "express";
import bcrypt from "bcrypt";
import { Login, Book, Rent } from "./src/config.js";
import nodemailer from "nodemailer";
import path from "path";
import bodyParser from "body-parser"
import  session  from "express-session";

const app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const users = [];
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.redirect('/login');
  }
}

app.get("/signup", (req, res) => {
  res.render("signup");
});

const viewsDirectory = "./";
// const __filename = fileURLToPath(import.meta.url);
app.set("views", path.join(viewsDirectory, "views"));
const publicDirectory = "./";
app.set("public", path.join(publicDirectory, "public"));
app.use(express.static(path.join(publicDirectory, "public")));
app.use(express.static(path.join(viewsDirectory, "views")));

app.post("/signup", async (req, res) => {
  const data = {
    fName: req.body.fName,
    lName: req.body.lName,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    gender: req.body.gender,
    phone: req.body.phone,
    birthdate: req.body.birthdate,
  };
  //   console.log(data);
  //Password at least be 8 digits
  if (data.password.length < 8) {
    return res.status(400).send("Password must be at least 8 characters long.");
  }
  // Validate if password contains at least 1 capital letter
  if (!/[A-Z]/.test(data.password)) {
    return res
      .status(400)
      .send("Password must contain at least one capital letter.");
  }

  // Validate if password contains at least 1 special character
  if (!/[\W_]/.test(data.password)) {
    return res
      .status(400)
      .send("Password must contain at least one special character.");
  }
  // Check if password matches confirmPassword
  if (data.password !== data.confirmPassword) {
    return res.status(400).send("Passwords do not match");
  }
  // Validate birthdate
  const birthYear = new Date(data.birthdate).getFullYear();
  if ((birthYear > 2012, birthYear < 1944)) {
    return res
      .status(400)
      .send("You must be between ages 12 to 80 to register.");
  }
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return res
      .status(400)
      .send(
        "Invalid email address format. Please enter a valid email address."
      );
  }
  // Validate phone number format and length
  const phoneRegex = /^0(1[0-2]\d{8}|[2-5]\d{7}|[8-9]\d{7})$/;
  const phone = data.phone.trim();
  console.log(phoneRegex.test(phone));
  if (!phoneRegex.test(phone)) {
    return res
      .status(400)
      .send(
        "Invalid phone number format. Phone number must start with 01 followed by 0, 1, or 2 and be 11 digits in length, or it can start with 02 to 05 or 08 to 09 and be 8 digits in length."
      );
  }
  // Validate first name and last name
  const nameRegex = /^[a-zA-Z]+$/;
  if (!nameRegex.test(data.fName) || !nameRegex.test(data.lName)) {
    return res
      .status(400)
      .send(
        "First name and last name must contain only alphabetical characters."
      );
  }
  if (data.fName.length < 3) {
    return res.status(400).send("Name must be at least 3 characters long.");
  }
  if (data.lName.length < 3) {
    return res.status(400).send("Name must be at least 3 characters long.");
  }
  const existingUser = await Login.findOne({ email: data.email });
  if (existingUser) {
    res.send("User already exists! Please choose a different username.");
  } else {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);
      const hashedConfirmPassword = await bcrypt.hash(
        data.confirmPassword,
        saltRounds
      ); // Hash confirm password
      data.password = hashedPassword;
      data.confirmPassword = hashedPassword;
      await Login.create(data);
      console.log("User created successfully:", data);
      res
        .status(200)
        .send({ staus: true, message: "user created successfully" });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).send("Error creating user. Please try again later.");
    }
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const email = await Login.findOne({ email: req.body.email });
    if (!email) {
      res.send("No account found! Please sign up.");
      return;
    }
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      email.password
    );
    if (isPasswordMatch) {
      res.status(200).send({ status: true, message: "logged in successfully" });
    } else {
      res.send("Wrong password");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("Error logging in. Please try again later.");
  }
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

const Transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hilltopheaven9@gmail.com",
    pass: "gzdu ylxr iwiq uukk",
  },
});

app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;
  const mailOptions = {
    from: `${name} <${email}>`,
    to: email,
    subject: "Message from Hilltop Heaven",
    text: "Thank you for contacting us",
  };

  Transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Error sending email" });
    } else {
      console.log("Email sent successfully!", info.response);
      Transporter.sendMail(
        {
          from: `${name} <${email}>`,
          to: "hilltopheaven9@gmail.com",
          subject: "Message from Hilltop Heaven",
          text: message,
        },
        (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            res.status(500).json({ error: "Error sending email" });
          } else {
            console.log("Email sent successfully!", info.response);
            res.status(200).json({ message: "Email sent successfully!" });
          }
        }
      );
    }
  });
});
//contact-pass--------gzdu ylxr iwiq uukk-------
app.get("/book", (req, res) => {
  res.render("book");
});

app.post("/book", async (req, res) => {
  const bookData = {
    cName: req.body.cName,
    checkInDate: req.body.checkInDate,
    checkOutDate: req.body.checkOutDate,
    numberOfPeople: req.body.numberOfPeople,
    cNumber: req.body.cNumber,
    cEmail: req.body.cEmail,
    comment: req.body.comment,
  };
  try {
    const newBooking = await Book.create(bookData); // Use Book model to create new booking
    console.log("Room successfully booked", newBooking);
    res.status(200).send({ status: true, message: "Room successfully booked" });
  } catch (error) {
    console.error("Error booking room:", error);
    res.status(500).send("Cannot book room. Please try again later.");
  }
});

app.get("/rent",isAuthenticated, (req, res) => {
  res.render("rent",{user: req.session.user});
});

app.post("/rent", async (req, res) => {
  const rentData = {
    pLocation: req.body.pLocation,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    pTime: req.body.pTime,
    carType: req.body.carType,
  };
  try {
    const newRent = await Rent.create(rentData);
    console.log("Car successfully rent", newRent);
    res.status(200).send({ status: true, message: "Car successfully Rent" });
  } catch (error) {
    console.error("Error renting a car", error);
    res.status(500).send("Cannot rent a car. Please try again later.");
  }
});

app.get("/info", (req, res) => {
  res.render("hotelinfo");
});

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/general", (req, res) => {
  res.render("general");
});

const port = 5200;
app.listen(port, () => {
  console.log(`Server Started on ${port}`);
});
