const routeNotFound = (req, res, next) => {
  res.status(404).json({
    code: 404,
    message: 'Route not found',
  });
}

export default routeNotFound;