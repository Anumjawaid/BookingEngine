module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // Automatically sends errors to the global handler
  };
};