// Ambient declarations for runtime-provided modules and Deno globals
// These reduce false-positive errors in the local TypeScript checker.

declare module "https://esm.sh/@hashgraph/sdk@2.75.0/es2022/sdk.mjs" {
  export const Client: any;
  export const PrivateKey: any;
  export const AccountId: any;
  export const TokenCreateTransaction: any;
  export const TokenType: any;
  export const TokenSupplyType: any;
  export const TokenMintTransaction: any;
  export const TransferTransaction: any;
  export default any;
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare const Deno: any;
