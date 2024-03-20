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
  token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZmE3MmQ0ZDQ1OTI0NDczYmI2MGIwMSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzEwOTEyMjg1fQ.50Q3uAeLMYq_4NO8fu8RW3GCi7JQ8kOzvru-49EHmVg";
  return token;
};