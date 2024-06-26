const responseMiddleware = (req, res, next) => {
  if (req.results) {
    res.status(200).json(req.results); 
  } else if (res.headersSent) { 
    console.error("Headers already sent, cannot send error response");
  } else {
    next(); 
  }
};

module.exports = responseMiddleware;