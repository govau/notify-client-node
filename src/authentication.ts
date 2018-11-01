import { Secret, sign } from 'jsonwebtoken';

export const createGovAuNotifyToken = (secret: Secret, client_id: string) => {

  return sign(
    {
      iss: client_id,
      iat: Math.round(Date.now() / 1000)
    },
    secret,
    {
      header: {typ: "JWT", alg: "HS256"}
    }
  );
};
