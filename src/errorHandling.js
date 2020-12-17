const badRequest = (err, req, res, next) => {
  if (err.httpStatusCode === 400) {
    res.status(404).send(err.message);
  }
  next(err);
};

const unauthorizedHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 401) {
    res.status(401).send("Unauthorized Access!");
  }
  next(err);
};

const forbiddenHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 403) {
    res.status(403).send("Forbidden!");
  }
  next(err);
};

const notFoundHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 404) {
    res.status(404).send("Sorry, Resource Not Found!");
  }
  next(err);
};

const catchAllHandler = (err, req, res, next) => {
  if (!res.headersSent) {
    res.status(err.httpStatusCode || 500).send("Oops, Something went wrong");
  }
};

module.exports = {
  badRequest,
  unauthorizedHandler,
  forbiddenHandler,
  notFoundHandler,
  catchAllHandler,
};
