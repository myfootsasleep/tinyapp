const express = require('express');
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["sefdaveaf"],
}));

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

//Function that returns URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = (id) => {
  return Object.entries(urlDatabase).reduce((acc, [key, value]) => {
    if (value.userID === id) {
      acc[key] = value;
    }
    return acc;
  }, {});
};
//Object of users
let users = {
  'aJ48lW': { userId: 'aJ48lW', email: 'richardoda@gmail.com', password: 'test' }
};
//Object of urlDatabase
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// Define route for /register path essentially calls the /register page
app.get("/register",(req,res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {
    user: user,
    urls: urlDatabase,
  };
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
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
  const hashedPass = bcrypt.hashSync(password, 10);
  const newUser = {
    userId: userRandomID,
    email: email,
    password: hashedPass
  };
  users[userRandomID] = newUser;

  req.session.user.id = userRandomID;
  res.redirect("/urls");
});

//Define route for handling new URL submissions
app.post("/urls", (req,res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    res.status(400).send("You can't shorten URLs unless you are a user, please login or register!");
  } else {
    const shortURL = generateShortUrl();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: userId
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

//Define route for login page
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
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
  const hashedPass = bcrypt.hashSync(password, 10);
  // Check if email or password are empty strings
  if (!email || !password) {
    res.status(400).send("Email and password cannot be empty");
    return;
  }

  // Find the user by email
  const user = Object.values(users).find((user) => user.email === email);
  // Check if user exists and if the password matches
  if (user && bcrypt.compareSync(password, hashedPass)) {
    req.session.user_id = user.userId;
    res.redirect("/urls");
  } else {
    res.status(401).send("Invalid email or password");
  }
});
//Define route for when someone presses the logout button
app.post("/logout", (req,res) => {
  req.session.user_id = null;
  res.redirect("/login");
});
//Define route for showing the index page with all existing URLs - urls_index.ejs
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const urls = urlsForUser(userId);
  const templateVars = {
    user: user,
    urls: urls,
  };
  if (!user) {
    res.status(400).send("You can't view shortened URL page unless you are logged in");
  } else {
    res.render("urls_index", templateVars);
  }
});

//Define route for showing the form to submit a new URL - url_new.ejs
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
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
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {
    urls: urlDatabase,
    longURL: urlDatabase[req.params.id].longURL,
    id: req.params.id,
    user: user
  };
  res.render("urls_show", templateVars);
});

//Define route for handling the edit button press
app.get("/urls/:id/edit", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const url = urlDatabase[req.params.id];
  if (!user || !url || url.userID !== userId) {
    res.status(400).send("Error, either you are not logged in, going to a link that does not exist, or do not have rights to visit");
  }
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
  const userId = req.session.user_id;
  const url = urlDatabase[req.params.id];
  const user = users[userId];
  if (!user || !url || url.userID !== userId) {
    res.status(400).send("Error, either you are not logged in, going to a link that does not exist, or do not have rights to visit");
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

//Define route for returning to full website once clicked
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const existingURL = checkShortUrl(shortURL);
  if (existingURL) {
    const longURL = urlDatabase[req.params.id].longURL;
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
