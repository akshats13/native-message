const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;

const app = express();
const port = 8000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
const jwt = require("jsonwebtoken");

mongoose
  .connect(
    "mongodb+srv://anshs13:milestone10@atlascluster.hsetwn2.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to Mongo Db");
  })
  .catch((err) => {
    console.log("Databse not conected");
  });

app.listen(port, () => {
  console.log("Server runnning on port 8000");
});

const User = require("./models/user");
const Message = require("./models/message");

//endpoint for user registeration

app.post("/register", (req, res) => {
  const { name, email, password, image } = req.body;

  //create a new user object
  const newUser = new User({ name, email, password, image });

  //save the user to database
  newUser
    .save()
    .then(() => {
      res.status(200).json({ message: "User registered successfully" });
    })
    .catch((err) => {
      console.log("Error registering user", err);
      res.status(500).json({ message: "Error registering usersss" });
    });
});

//fucntion to create token for the user

const createToken = (userId) => {
  //set the token payload
  const payload = {
    userId: userId,
  };

  const token = jwt.sign(payload, "Q$r2K6W8n!jCW%Zk", { expiresIn: "1h" });

  return token;
};

//endpoint for loggin in the user

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  //check if the email and password are provided
  if (!email || !password) {
    return res.status(404).json({ message: "Email and password are required" });
  }

  //check for the user in the database
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        //user not found
        return res.status(404).json({ message: "User not found" });
      }

      //comapre the provided password with the password in the database
      if (user.password !== password) {
        return res.status(404).json({ message: "Invalid Password " });
      }

      const token = createToken(user._id);
      res.status(200).json({ token });
    })
    .catch((err) => {
      console.log("Error in finding the user", error);
      res.status(500).json({ message: "Internal server error!" });
    });
});

//endpoint to access all the users except for the user who is currently logged in

app.get("/users/:userId", (req, res) => {
  const loggedInUserId = req.params.userId;

  User.find({ _id: { $ne: loggedInUserId } })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log("Error retrieving users", err);
      res.status(500).json({ message: "Error retrieving users" });
    });
});

//endpoint to send a friend request to a user

app.post("/friend-request", async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;

  try {
    //update the recievers friendrequest array
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { friendRequests: currentUserId },
    });

    //update the receivers sent friend request arary
    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentFriendRequests: selectedUserId },
    });

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  }
});

//endpoints to show all the friend request of the particular user

app.get("/friend-request/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user document based on the userId

    const user = await User.findById(userId)
      .populate("friendRequests", "name email image")
      .lean();

    const friendRequests = user.friendRequests;
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//endpoints to accept the request of a particular user

app.post("/friend-request/acccept", async (req, res) => {
  try {
    const { senderId, recepientId } = req.body;

    //retrieve the document of the sender and the recipient

    const sender = await User.findById(senderId);
    const recepient = await User.findById(recepientId);

    sender.friends.push(recepientId);
    recepient.friends.push(senderId);

    recepient.friendRequests = recepient.friendRequests.filter(
      (request) => request.toString() !== senderId.toString()
    );

    sender.friendRequests = sender.friendRequests.filter(
      (request) => request.toString() !== recepientId.toString()
    );

    await sender.save();
    await recepient.save();

    res.status(200).json({ message: "Friend request accepted successfyully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//endpoints to access all the friend of the logged in user

app.get("/accepted-friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      "friends",
      "name email image"
    );

    const acceptedFriends = user.friends;
    //send the request to the front end
    res.json(acceptedFriends);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const multer = require("multer");

//CONFIGURE MULTER FOR HANDING FILE UPLOADS
const storage = mutler.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "files/"); //specify the desired destinaion folder
  },
  filename: function (req, file, cb) {
    //generate a unique filename for the uploaded file
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

//endpoint to post messages and store it in the backend

app.post("/messages", upload.single("imageFile"), async (req, res) => {
  try {
    const { senderId, recepientId, messageType, messageText } = req.body;

    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message: messageText,
      timeStamp: new Data(),
      imageUrl: messageType === "image" ? req.file.path : null,
    });

    await newMessage.save();
    res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.log("Error uploading image", err);
    res.status(500).json({ err: "Internal Service Error" });
  }
});

//endpoint to get the user details we are chatting with

app.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user data from the user ID

    const recepientId = await User.findById(userId);

    res.json(recepientId);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Internal Service Error" });
  }
});

//endpoint to fetch the message between two users in the chat rooom

app.get("/messages/:senderId/:recepientId", async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, recepientId: recepientId },
        { senderId: recepientId, recepientId: senderId },
      ],
    }).populate("senderId", "_id name");

    res.json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Internal Service Error" });
  }
});

//endpoint to delete messages

app.post("/deleteMessages", async (req, res) => {
  try {
    const { messages } = req.body;

    if (Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ messages: "invalid req body!" });
    }

    await Message.deleteMany({ _id: { $in: messages } });

    res.json({ message: "Messages deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Internal service error" });
  }
});
