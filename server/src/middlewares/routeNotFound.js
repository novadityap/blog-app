const routeNotFound = (req, res) => {
  res.status(404).json({
    code: 404,
    message: 'Route not found',
  });
}

export default routeNotFound;