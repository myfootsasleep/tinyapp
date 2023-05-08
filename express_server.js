const express = require('express');
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({extnded: true}));
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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9ssm5xk": "http://www.google.com"
};


app.use((req, res, next) => {
  const username = req.cookies.username; // Assuming you are using cookies to store the username
  res.locals.username = username; // Set the username in res.locals
  next();
});
//Define route for handling new URL submissions
app.post("/urls", (req,res) => {
  const shortURL = generateShortUrl();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Define route for showing the index page with all existing URLs - urls_index.ejs
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Define route for showing the form to submit a new URL - url_new.ejs
app.get("/urls/new", (req,res) => {
  const templateVars = {
  };
  res.render("urls_new", templateVars);
});

//Define route for handling requests of newly added URL
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    longURL: urlDatabase[req.params.id],
    id: req.params.id
  };
  res.render("urls_show", templateVars);
});

//Define route for handling the edit button press
app.post("/urls/:id", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    longURL: urlDatabase[req.params.id],
    id: req.params.id
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
app.post("/login", (req,res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});
//Define route for when someone presses the logout button
app.post("/logout", (req,res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("register");
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
