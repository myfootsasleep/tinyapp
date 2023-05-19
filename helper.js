const {users, urlDatabase} = require("./database");

//Function that checks to see if the email is already registered or not
const getUserByEmail = (email, db) => {
  // loop in database keys
  for (let key in db) {
    // compare the emails, if they match return the user obj
    if (db[key].email === email) {
      return db[key];
    }
  }
  return undefined;
};

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

//Function that checks to see if a shortUrl Exists or not
const checkShortUrl = (shortURL) => {
  return Object.keys(urlDatabase).find((shortendURL) => shortendURL === shortURL);
};

//Function that returns URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = (id) => {
  return Object.entries(urlDatabase).reduce((userUrls, [key, value]) => {
    if (value.userID === id) {
      userUrls[key] = value;
    }
    return userUrls;
  }, {});
};


module.exports = {getUserByEmail, generateShortUrl, checkShortUrl, urlsForUser};