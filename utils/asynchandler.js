const asynchandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next); // Pass only req, res, next to the route handler
    } catch (error) {
      // If an error occurs, send a 500 status with the error message
      res.status(500).json({ message: error.message });
    }
  };
};

export default asynchandler;
