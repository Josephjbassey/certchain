// Ambient declarations for runtime-provided modules and Deno globals
// These reduce false-positive errors in the local TypeScript checker.

declare module "https://esm.sh/@hashgraph/sdk@2.75.0/es2022/sdk.mjs" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Client: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const PrivateKey: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const AccountId: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const TokenCreateTransaction: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const TokenType: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const TokenSupplyType: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const TokenMintTransaction: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const TransferTransaction: any;
  export default any;
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;
