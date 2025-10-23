// Ambient declarations for runtime-provided modules and Deno globals
// These reduce false-positive errors in the local TypeScript checker.

declare module "https://cdn.skypack.dev/pin/@hashgraph/sdk@v2.75.0-Eb6kMqKSHEGRj8RngoyB/mode=imports/optimized/@hashgraph/sdk.js" {
  export const Client: any;
  export const PrivateKey: any;
  export const AccountId: any;
  export const TokenCreateTransaction: any;
  export const TokenType: any;
  export const TokenSupplyType: any;
  export const TokenMintTransaction: any;
  export const TransferTransaction: any;
  const _default: any;
  export default _default;
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare const Deno: any;
