import type { ErrorRequestHandler } from "express";

type ErrorWithCode = {
  code?: unknown;
};

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  const { code } = error as ErrorWithCode;
  return typeof code === "string" ? code : undefined;
}

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  console.error(`${req.method} ${req.originalUrl}`, error);

  const errorCode = getErrorCode(error);

  if (errorCode === "P2002") {
    res.status(409).json({
      message: "Resource already exists"
    });
    return;
  }

  if (errorCode === "P2003") {
    res.status(409).json({
      message: "Related resource does not exist"
    });
    return;
  }

  if (errorCode === "P2025") {
    res.status(404).json({
      message: "Resource not found"
    });
    return;
  }

  if (
    errorCode === "P1001" ||
    errorCode === "P1002" ||
    errorCode === "P1008" ||
    errorCode === "P1017"
  ) {
    res.status(503).json({
      message: "Service temporarily unavailable"
    });
    return;
  }

  res.status(500).json({
    message: "Internal server error"
  });
};
