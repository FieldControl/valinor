// src/auth/jwt-payload.interface.ts
export interface JwtPayload {
  email: string;
  sub: number; // 'sub' é o padrão para o ID do usuário no JWT
}
