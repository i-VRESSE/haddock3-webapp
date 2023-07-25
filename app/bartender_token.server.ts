/**
 * Functions dealing with access token of bartender web service.
 */
import { readFile } from "fs/promises";
import { type KeyLike, SignJWT, importPKCS8 } from "jose";
import { getUser } from "./auth.server";
import { json } from "@remix-run/node";
import { getLevel, isSubmitAllowed } from "./models/user.server";


class TokenGenerator {
  private privateKeyFilename: string;
  private issuer: string;
  private privateKey: KeyLike | undefined = undefined;
  constructor(privateKeyFilename: string, issuer: string = 'bartender') {
    this.privateKeyFilename = privateKeyFilename;
    this.issuer = issuer;
  }

  async init() {
    if (this.privateKey) {
      return
    }
    const alg = 'RS256'
    const privateKeyBody = await readFile(this.privateKeyFilename, 'utf8');
    const privateKey = await importPKCS8(privateKeyBody, alg);
    this.privateKey = privateKey;
  }

  async generate(sub: string, email: string, roles: string[]) {
    if (!this.privateKey) {
      throw new Error('private key not initialized')
    }
    const jwt = await new SignJWT({
      email: email,
      roles: roles,
    }).setIssuer(this.issuer)
      .setExpirationTime('30d')
      .setIssuedAt()
      .setSubject(sub)
      .setProtectedHeader({ alg: 'RS256' })
      .sign(this.privateKey);
    return jwt
  }

}
const privateKeyFilename = process.env.BARTENDER_PRIVATE_KEY || 'private_key.pem';
// TODO only use singleton if reading private key is slow
const generator = new TokenGenerator(privateKeyFilename);

export async function getAccessToken(request:Request) {
  const user = await getUser(request);
  if (!user) {
    throw json({ error: "Unauthorized" }, { status: 401 });
  }
  const roles = user.roles.map(r => r.name)
  const level = await getLevel(roles);
  if (!isSubmitAllowed(level)) {
    throw json({ error: "Forbidden" }, { status: 403 });
  }

  await generator.init();
  return await generator.generate(user.id, user.email, roles);
}