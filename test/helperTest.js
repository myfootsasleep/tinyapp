const { assert } = require('chai');

const { getUserByEmail } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
  });
  it('should return undefined if non-existant email is tested', function() {
    const user = getUserByEmail("random@example.com", testUsers);
    const expectedUserID = "user2RandomID";
  });
});