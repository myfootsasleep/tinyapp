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


module.exports = {getUserByEmail};