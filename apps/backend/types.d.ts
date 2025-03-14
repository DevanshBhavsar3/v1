declare global {
  declare namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export type ProjectType = "NEXTJS" | "REACT_NATIVE" | "REACT";
