import { Secret, sign } from "jsonwebtoken";

export const createJwtToken = (secret: Secret, clientId: string) => {
  return sign(
    {
      iss: clientId,
      iat: Math.round(Date.now() / 1000)
    },
    secret,
    {
      header: { typ: "JWT", alg: "HS256" }
    }
  );
};
