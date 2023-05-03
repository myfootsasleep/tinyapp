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
  "b2xVn2": "http://www.lighouselabs.ca",
  "9ssm5xk": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req,res) => {
  console.log(req.body);
  res.send("Ok");
});

for (const amount in urlDatabase) {
  app.get(`/urls/${amount}`, (req, res) => {
    const templateVars = {urls: urlDatabase,
      longURL: urlDatabase[amount],
      id: amount};
    res.render("urls_show", templateVars);
  });
}
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req,res) => {
  res.json(urlDatabase);
});

app.get('/hello',(req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req,res) => {
  res.render("urls_new");
});

