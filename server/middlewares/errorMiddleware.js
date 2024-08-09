import ResponseError from "../utils/responseError.js";
import logger from "../config/logger.js";
import isJson from "../utils/isJson.js";

const errorMiddleware = (err, req, res, next) => {
  const isBadRequest = err.status === 400;

  if(isBadRequest) {
    if(isJson(err.message)) return res.status(err.status).json({error: JSON.parse(err.message)});
    return res.status(err.status).json({error: err.message});
  } else if(err instanceof ResponseError && !isBadRequest) {
    return res.status(err.status).json({error: err.message})
  } else {
    logger.error(err);
    return res.status(500).json({error: "Internal Server Error"});
  }
}

export default errorMiddleware;