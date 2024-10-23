const queryHandler = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const skip = (page - 1) * limit;

  const filters = { ...req.query };
  delete filters.page;
  delete filters.limit;
  delete filters.search;

  req.queryOptions = {
    filters,
    page,
    limit,
    search,
    skip,
  };
  next();
};

export default queryHandler;