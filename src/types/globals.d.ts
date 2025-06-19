// types/globals.d.ts
export {};
export type AppRole = "admin" | "manager";

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      // Per sessioni browser standard
      role?: AppRole;
    };
    publicMetadata?: {
      // Per token JWT da template
      role?: AppRole;
    };
   
  }
}
