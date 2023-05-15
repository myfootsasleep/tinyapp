//Function that checks to see if the email is already registered or not
const getUserByEmail = (email, users) => {
  return Object.values(users).find((user) => user.email === email);
};

module.exports = {getUserByEmail};