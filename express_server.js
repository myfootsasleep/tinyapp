const express = require('express');
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

const generateShortUrl = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
let users = {

};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9ssm5xk": "http://www.google.com"
};

const getUserByEmail = (email) => {
  return Object.values(users).find((user) => user.email === email);
};

app.post("/register", (req, res) => {
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

  // Proceed with user registration
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
app.get("/register", (req, res) => {
  const templateVars = {
    users: null, // Set a default value for the user variable
    // ... other variables ...
  };

  res.render("register", templateVars);
});

// app.use((req, res, next) => {
//   const username = req.cookies.username; // Assuming you are using cookies to store the username
//   res.locals.username = username; // Set the username in res.locals
//   next();
// });
//Define route for handling new URL submissions
app.post("/urls", (req,res) => {
  const shortURL = generateShortUrl();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
// app.post("/login", (req,res) => {
//   const username = req.body.username;
//   res.cookie("username", username);
//   res.redirect("/urls");
// });
//Define route for when someone presses the logout button
app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
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
  res.render("urls_new", templateVars);
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
app.post("/urls/:id/edit", (req, res) => {
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
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//Define route for when someone enters username and presses login



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
