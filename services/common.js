const passport = require('passport');

exports.isAuth = (req, res, done) => {
  return passport.authenticate('jwt');
};

exports.cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  //TODO : this is temporary token for testing without cookie
  token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjkxYjJkYmRkZjJlOGFhNGY4MjljMSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzEwODI0MjM3fQ.7wfQWBQSZZAkrzMHLudw5HbqHJC1uEOPXxigXJSJ0RE"
  return token;
};