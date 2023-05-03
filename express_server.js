const express = require('express');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({extnded: true}));

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

//Define route for handling new URL submissions
app.post("/urls", (req,res) => {
  const shortURL = generateShortUrl();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Define route for showing the index page with all existing URLs - urls)index.ejs

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Define route for showing the form to submit a new URL - url_new.ejs
app.get("/urls/new", (req,res) => {
  res.render("urls_new");
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

//Define route for returning to full website once clicked
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
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
