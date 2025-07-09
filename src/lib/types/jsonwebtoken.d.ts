declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: number;
    email: string;
    name: string;
  }

  export function sign(payload: object, secretOrPrivateKey: string, options?: object): string;
  export function verify(token: string, secretOrPublicKey: string): JwtPayload;
}