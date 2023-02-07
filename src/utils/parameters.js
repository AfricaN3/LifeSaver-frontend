import { gasContractAddress } from "./constants";

export const isGasSupportedParams = {
  operation: "isTokenSupported",
  args: [{ type: "Hash160", value: gasContractAddress }],
};
