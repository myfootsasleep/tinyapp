const express = require('express');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighouselabs.ca",
  "9ssm5xk": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
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

