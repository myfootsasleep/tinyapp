const express = require('express');
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

//Function that create a unique Id used in both users and shortURLs
const generateShortUrl = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
//Function that checks to see if the email is already registered or not
const getUserByEmail = (email) => {
  return Object.values(users).find((user) => user.email === email);
};

//Function that checks to see if a shortUrl Exists or not
const checkShortUrl = (shortURL) => {
  return Object.keys(urlDatabase).find((shortendURL) => shortendURL === shortURL);
};

//Object of users
let users = {
  '0Tjmfm': { userId: '0Tjmfm', email: 'richardoda@gmail.com', password: 'test' }
};
//Object of urlDatabase
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9ssm5xk": "http://www.google.com"
};

// Define route for /register path essentially calls the /register page
app.get("/register",(req,res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = {
    user: user,
    urls: urlDatabase,
  };
  if (user) {
    res.redirect("/urls");
  } else {
    res.get("register", templateVars);
  }
});
//Define route pate for when someone creates a new account
app.post("/register/createAccount", (req, res) => {
  const { email, password } = req.body;

  // Check if email or password are empty strings
  if (!email || !password) {
    res.status(400).send("Email and password cannot be empty");
    return;
  }

  // Check if email already exists in users object
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    res.status(400).send("Email already registered");
    return;
  }

  //Proceed with user registration
  const userRandomID = generateShortUrl();
  const newUser = {
    userId: userRandomID,
    email: email,
    password: password
  };
  users[userRandomID] = newUser;

  res.cookie("user_id", userRandomID);
  res.redirect("/urls");
});

//Define route for handling new URL submissions
app.post("/urls", (req,res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  if (!user) {
    res.status(400).send("You can't shorten URLs unless you are a user, please login or register!");
  } else {
    const shortURL = generateShortUrl();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  }
});

//Define route for login page
app.get("/login", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = {
    user: user,
    urls: urlDatabase,
  };
  if (user) {
    res.redirect("/urls");
  }
  res.render("login", templateVars);
});
//Define route for when someone enters username and presses login
app.post("/login/verify", (req, res) => {
  const { email, password } = req.body;

  // Check if email or password are empty strings
  if (!email || !password) {
    res.status(400).send("Email and password cannot be empty");
    return;
  }

  // Find the user by email
  const user = Object.values(users).find((user) => user.email === email);
  // console.log(users);
  // Check if user exists and if the password matches
  if (user && user.password === password) {
    res.cookie("user_id", user.userId);
    res.redirect("/urls");
  } else {
    res.status(401).send("Invalid email or password");
  }
});
//Define route for when someone presses the logout button
app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});
//Define route for showing the index page with all existing URLs - urls_index.ejs
app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = {
    user: user,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//Define route for showing the form to submit a new URL - url_new.ejs
app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = {
    user: user,
  };
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//Define route for handling requests of newly added URL
app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = {
    urls: urlDatabase,
    longURL: urlDatabase[req.params.id],
    id: req.params.id,
    user: user
  };
  res.render("urls_show", templateVars);
});

//Define route for handling the edit button press
app.get("/urls/:id/edit", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = {
    urls: urlDatabase,
    longURL: urlDatabase[req.params.id],
    id: req.params.id,
    user: user
  };
  res.render("urls_show", templateVars);
});

//Define route for updating long URLS
app.post("/urls/:id/update", (req, res) =>{
  const id = req.params.id;
  const newURL = req.body.newURL;
  urlDatabase[id] = newURL;
  res.redirect("/urls");
});

//Define route for handling deletion of shortened URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

//Define route for returning to full website once clicked
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const existingURL = checkShortUrl(shortURL);
  if (existingURL) {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
  } else {
    res.status(400).send("Trying to TinyLink that doesn't exist");
  }
});

//Define route for returning JSON object of the urlDatabase
app.get("/urls.json", (req,res) => {
  res.json(urlDatabase);
});

//Define a basic "hello world" route in root
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Define a "hello world" in a new route that is not root
app.get('/hello',(req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
