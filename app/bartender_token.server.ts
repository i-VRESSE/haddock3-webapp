/**
 * Functions dealing with access token of bartender web service.
 */
import { readFile } from "fs/promises";
import { type KeyLike, SignJWT, importPKCS8, decodeJwt } from "jose";

import { getUser } from "./auth.server";
import type { User } from "./models/user.server";
import { setBartenderToken } from "./models/user.server";

const alg = "RS256";

export class TokenGenerator {
  private privateKeyFilename: string;
  private issuer: string;
  private lifeSpan: string;
  private privateKey: KeyLike | undefined = undefined;
  constructor(
    privateKeyFilename: string,
    issuer = "haddock3-webapp",
    lifespan = "8h"
  ) {
    this.privateKeyFilename = privateKeyFilename;
    this.issuer = issuer;
    this.lifeSpan = lifespan;
  }

  async init() {
    if (this.privateKey) {
      return;
    }
    const privateKeyBody = await readFile(this.privateKeyFilename, "utf8");
    const privateKey = await importPKCS8(privateKeyBody, alg);
    this.privateKey = privateKey;
  }

  async generate(sub: string, email: string) {
    if (!this.privateKey) {
      throw new Error("private key not initialized");
    }
    const jwt = await new SignJWT({
      email: email,
    })
      .setIssuer(this.issuer)
      .setExpirationTime(this.lifeSpan)
      .setIssuedAt()
      .setSubject(sub)
      .setProtectedHeader({ alg })
      .sign(this.privateKey);
    return jwt;
  }
}
const privateKeyFilename =
  process.env.BARTENDER_PRIVATE_KEY || "private_key.pem";
const generator = new TokenGenerator(privateKeyFilename);

export async function getBartenderToken(request: Request) {
  const user = await getUser(request);
  return getBartenderTokenByUser(user);
}

export async function getBartenderTokenByUser(user: User) {
  // if token expires in less than 2 minutes, refresh it
  const leeway = 120;
  const nowInSeconds = new Date().getTime() / 1000;
  const tokenIsExpired = user.bartenderTokenExpiresAt < nowInSeconds + leeway;
  if (tokenIsExpired || !user.bartenderToken) {
    await generator.init();
    const token = await generator.generate(user.id, user.email);
    const { exp } = decodeJwt(token);
    await setBartenderToken(user.id, token, exp!);
    return token;
  }
  return user.bartenderToken;
}
