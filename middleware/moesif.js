const moesif = require('moesif-nodejs');

const moesifMiddleware = moesif({
  applicationId: 'eyJhcHAiOiI0ODc6MjMyIiwidmVyIjoiMi4wIiwib3JnIjoiNDIwOjIwOSIsImlhdCI6MTYzMDQ1NDQwMH0.-LzOT9JwxnhzEW2jv405iMijGV77GRNIRjN1JzYyiK0'

  /** * Optional hook to link API calls to users
  identifyUser: function (req, res) {
    return req.user ? req.user.id : undefined;
  },**/
});

module.exports = moesifMiddleware;