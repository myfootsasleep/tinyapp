const express = require('express');
const app = express();
const PORT = 8080;

const urIDatabase = {
  "b2xVn2": "http://www.lighouselabs.ca",
  "9ssm5xk": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});