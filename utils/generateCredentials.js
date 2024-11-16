import crypto from "crypto";

export const generateCredentials = () => {
  const password = crypto.randomBytes(12).toString("hex");
  return { password };
};