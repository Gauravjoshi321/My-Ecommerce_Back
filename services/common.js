const passport = require('passport');

exports.isAuth = (req, res, done) => {
  return passport.authenticate('jwt');
};

exports.sanitizeUser = (user) => {
  return { id: user.id, role: user.role };
};

exports.cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  //TODO : this is temporary token for testing without cookie
  token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1Zjg0MWU4M2JhMjE2OWE4YmY5ZGYzZSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzEwNzY5NTI0fQ.-W6j1z8Sep6AA2RzMWyONob6jdsf-sAaTG6obVwixOE"
  return token;
};