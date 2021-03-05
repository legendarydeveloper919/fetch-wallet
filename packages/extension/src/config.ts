import { Bech32Address } from "@keplr-wallet/cosmos";
import { ChainInfo, FiatCurrency } from "@keplr-wallet/types";

import {
  PRIVILEGED_ORIGINS,
  COSMOS_REST_CONFIG,
  COSMOS_REST_ENDPOINT,
  COSMOS_RPC_CONFIG,
  COSMOS_RPC_ENDPOINT,
  ETHEREUM_ENDPOINT,
  KAVA_REST_CONFIG,
  KAVA_REST_ENDPOINT,
  KAVA_RPC_CONFIG,
  KAVA_RPC_ENDPOINT,
  SECRET_NETWORK_REST_CONFIG,
  SECRET_NETWORK_REST_ENDPOINT,
  SECRET_NETWORK_RPC_CONFIG,
  SECRET_NETWORK_RPC_ENDPOINT,
  BETA_CYBER_NETWORK_REST_ENDPOINT,
  BETA_CYBER_NETWORK_REST_CONFIG,
  BETA_CYBER_NETWORK_RPC_ENDPOINT,
  BETA_CYBER_NETWORK_RPC_CONFIG,
  BETA_STRAIGHTEDGE_REST_ENDPOINT,
  BETA_STRAIGHTEDGE_REST_CONFIG,
  BETA_STRAIGHTEDGE_RPC_ENDPOINT,
  BETA_STRAIGHTEDGE_RPC_CONFIG,
  ADDITIONAL_SIGN_IN_PREPEND,
  ADDITIONAL_INTL_MESSAGES,
  AKASH_RPC_ENDPOINT,
  AKASH_RPC_CONFIG,
  AKASH_REST_ENDPOINT,
  AKASH_REST_CONFIG,
  IOV_RPC_ENDPOINT,
  IOV_RPC_CONFIG,
  IOV_REST_ENDPOINT,
  IOV_REST_CONFIG,
  CERTIK_RPC_ENDPOINT,
  CERTIK_RPC_CONFIG,
  CERTIK_REST_ENDPOINT,
  CERTIK_REST_CONFIG,
  SIFCHAIN_RPC_ENDPOINT,
  SIFCHAIN_RPC_CONFIG,
  SIFCHAIN_REST_ENDPOINT,
  SIFCHAIN_REST_CONFIG,
  IRIS_RPC_ENDPOINT,
  IRIS_RPC_CONFIG,
  IRIS_REST_ENDPOINT,
  IRIS_REST_CONFIG,
} from "./config.var";
import {
  IntlMessages,
  LanguageToFiatCurrency as TypeLanguageToFiatCurrency,
} from "./languages";
import { RegisterOption } from "@keplr-wallet/hooks";

export const CoinGeckoAPIEndPoint = "https://api.coingecko.com/api/v3";
export const CoinGeckoGetPrice = "/simple/price";
export const AutoFetchingFiatValueInterval = 300 * 1000; // 5min

export const AutoFetchingAssetsInterval = 15 * 1000; // 15sec

// Endpoint for Ethereum node.
// This is used for ENS.
export const EthereumEndpoint = ETHEREUM_ENDPOINT;

export const EmbedChainInfos: ChainInfo[] = [
  {
    rpc: COSMOS_RPC_ENDPOINT,
    rpcConfig: COSMOS_RPC_CONFIG,
    rest: COSMOS_REST_ENDPOINT,
    restConfig: COSMOS_REST_CONFIG,
    chainId: "cosmoshub-4",
    chainName: "Cosmos",
    stakeCurrency: {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
      coinGeckoId: "cosmos",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub/stake"
        : "http://localhost:8081/#/cosmoshub/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/cosmoshub/stake"
        : "http://localhost:8081/#/cosmoshub/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("cosmos"),
    currencies: [
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ATOM",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
      },
    ],
    coinType: 118,
    features: ["stargate"],
  },
  {
    rpc: KAVA_RPC_ENDPOINT,
    rpcConfig: KAVA_RPC_CONFIG,
    rest: KAVA_REST_ENDPOINT,
    restConfig: KAVA_REST_CONFIG,
    chainId: "kava-4",
    chainName: "Kava",
    stakeCurrency: {
      coinDenom: "KAVA",
      coinMinimalDenom: "ukava",
      coinDecimals: 6,
      coinGeckoId: "kava",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/kava/stake"
        : "http://localhost:8081/#/kava/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/kava/stake"
        : "http://localhost:8081/#/kava/stake",
    bip44: { coinType: 459 },
    alternativeBIP44s: [{ coinType: 118 }],
    bech32Config: Bech32Address.defaultBech32Config("kava"),
    currencies: [
      {
        coinDenom: "KAVA",
        coinMinimalDenom: "ukava",
        coinDecimals: 6,
        coinGeckoId: "kava",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "KAVA",
        coinMinimalDenom: "ukava",
        coinDecimals: 6,
        coinGeckoId: "kava",
      },
    ],
    coinType: 459,
  },
  {
    rpc: SECRET_NETWORK_RPC_ENDPOINT,
    rpcConfig: SECRET_NETWORK_RPC_CONFIG,
    rest: SECRET_NETWORK_REST_ENDPOINT,
    restConfig: SECRET_NETWORK_REST_CONFIG,
    chainId: "secret-2",
    chainName: "Secret Network",
    stakeCurrency: {
      coinDenom: "SCRT",
      coinMinimalDenom: "uscrt",
      coinDecimals: 6,
      coinGeckoId: "secret",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/secret/stake"
        : "http://localhost:8081/#/secret/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/secret/stake"
        : "http://localhost:8081/#/secret/stake",
    bip44: {
      coinType: 529,
    },
    alternativeBIP44s: [
      {
        coinType: 118,
      },
    ],
    bech32Config: Bech32Address.defaultBech32Config("secret"),
    currencies: [
      {
        coinDenom: "SCRT",
        coinMinimalDenom: "uscrt",
        coinDecimals: 6,
        coinGeckoId: "secret",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "SCRT",
        coinMinimalDenom: "uscrt",
        coinDecimals: 6,
        coinGeckoId: "secret",
      },
    ],
    coinType: 529,
    gasPriceStep: {
      low: 0.25,
      average: 0.3,
      high: 0.4,
    },
    features: ["secretwasm"],
  },
  {
    rpc: AKASH_RPC_ENDPOINT,
    rpcConfig: AKASH_RPC_CONFIG,
    rest: AKASH_REST_ENDPOINT,
    restConfig: AKASH_REST_CONFIG,
    chainId: "akashnet-1",
    chainName: "Akash",
    stakeCurrency: {
      coinDenom: "AKT",
      coinMinimalDenom: "uakt",
      coinDecimals: 6,
      coinGeckoId: "akash-network",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/akashnet/stake"
        : "http://localhost:8081/#/akashnet/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/akashnet/stake"
        : "http://localhost:8081/#/akashnet/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("akash"),
    currencies: [
      {
        coinDenom: "AKT",
        coinMinimalDenom: "uakt",
        coinDecimals: 6,
        coinGeckoId: "akash-network",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "AKT",
        coinMinimalDenom: "uakt",
        coinDecimals: 6,
        coinGeckoId: "akash-network",
      },
    ],
  },
  {
    rpc: IOV_RPC_ENDPOINT,
    rpcConfig: IOV_RPC_CONFIG,
    rest: IOV_REST_ENDPOINT,
    restConfig: IOV_REST_CONFIG,
    chainId: "iov-mainnet-2",
    chainName: "Starname",
    stakeCurrency: {
      coinDenom: "IOV",
      coinMinimalDenom: "uiov",
      coinDecimals: 6,
      coinGeckoId: "starname",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/iov-mainnet/stake"
        : "http://localhost:8081/#/iov-mainnet/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/iov-mainnet/stake"
        : "http://localhost:8081/#/iov-mainnet/stake",
    bip44: {
      coinType: 234,
    },
    bech32Config: Bech32Address.defaultBech32Config("star"),
    currencies: [
      {
        coinDenom: "IOV",
        coinMinimalDenom: "uiov",
        coinDecimals: 6,
        coinGeckoId: "starname",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "IOV",
        coinMinimalDenom: "uiov",
        coinDecimals: 6,
        coinGeckoId: "starname",
      },
    ],
    gasPriceStep: {
      low: 1,
      average: 2,
      high: 3,
    },
  },
  {
    rpc: SIFCHAIN_RPC_ENDPOINT,
    rpcConfig: SIFCHAIN_RPC_CONFIG,
    rest: SIFCHAIN_REST_ENDPOINT,
    restConfig: SIFCHAIN_REST_CONFIG,
    chainId: "sifchain",
    chainName: "Sifchain",
    stakeCurrency: {
      coinDenom: "ROWAN",
      coinMinimalDenom: "rowan",
      coinDecimals: 18,
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/sifchain/stake"
        : "http://localhost:8081/#/sifchain/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/sifchain/stake"
        : "http://localhost:8081/#/sifchain/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("sif"),
    currencies: [
      {
        coinDenom: "ROWAN",
        coinMinimalDenom: "rowan",
        coinDecimals: 18,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "ROWAN",
        coinMinimalDenom: "rowan",
        coinDecimals: 18,
      },
    ],
    gasPriceStep: {
      low: 500000000000,
      average: 1000000000000,
      high: 2000000000000,
    },
  },
  {
    rpc: CERTIK_RPC_ENDPOINT,
    rpcConfig: CERTIK_RPC_CONFIG,
    rest: CERTIK_REST_ENDPOINT,
    restConfig: CERTIK_REST_CONFIG,
    chainId: "shentu-1",
    chainName: "Certik",
    stakeCurrency: {
      coinDenom: "CTK",
      coinMinimalDenom: "uctk",
      coinDecimals: 6,
      coinGeckoId: "certik",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/shentu/stake"
        : "http://localhost:8081/#/shentu/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/shentu/stake"
        : "http://localhost:8081/#/shentu/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("certik"),
    currencies: [
      {
        coinDenom: "CTK",
        coinMinimalDenom: "uctk",
        coinDecimals: 6,
        coinGeckoId: "certik",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "CTK",
        coinMinimalDenom: "uctk",
        coinDecimals: 6,
        coinGeckoId: "certik",
      },
    ],
  },
  {
    rpc: IRIS_RPC_ENDPOINT,
    rpcConfig: IRIS_RPC_CONFIG,
    rest: IRIS_REST_ENDPOINT,
    restConfig: IRIS_REST_CONFIG,
    chainId: "irishub-1",
    chainName: "IRISnet",
    stakeCurrency: {
      coinDenom: "IRIS",
      coinMinimalDenom: "uiris",
      coinDecimals: 6,
      coinGeckoId: "iris-network",
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/irishub/stake"
        : "http://localhost:8081/#/irishub/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/irishub/stake"
        : "http://localhost:8081/#/irishub/stake",
    bip44: {
      coinType: 566,
    },
    bech32Config: Bech32Address.defaultBech32Config("iaa"),
    currencies: [
      {
        coinDenom: "IRIS",
        coinMinimalDenom: "uiris",
        coinDecimals: 6,
        coinGeckoId: "iris-network",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "IRIS",
        coinMinimalDenom: "uiris",
        coinDecimals: 6,
        coinGeckoId: "iris-network",
      },
    ],
    gasPriceStep: {
      low: 0.2,
      average: 0.3,
      high: 0.4,
    },
  },
  {
    rpc: BETA_CYBER_NETWORK_RPC_ENDPOINT,
    rpcConfig: BETA_CYBER_NETWORK_RPC_CONFIG,
    rest: BETA_CYBER_NETWORK_REST_ENDPOINT,
    restConfig: BETA_CYBER_NETWORK_REST_CONFIG,
    chainId: "euler-6",
    chainName: "Cyber",
    stakeCurrency: {
      coinDenom: "EUL",
      coinMinimalDenom: "eul",
      coinDecimals: 0,
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/euler/stake"
        : "http://localhost:8081/#/euler/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/euler/stake"
        : "http://localhost:8081/#/euler/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("cyber"),
    currencies: [
      {
        coinDenom: "EUL",
        coinMinimalDenom: "eul",
        coinDecimals: 0,
      },
    ],
    feeCurrencies: [],
    beta: true,
  },
  {
    rpc: BETA_STRAIGHTEDGE_RPC_ENDPOINT,
    rpcConfig: BETA_STRAIGHTEDGE_RPC_CONFIG,
    rest: BETA_STRAIGHTEDGE_REST_ENDPOINT,
    restConfig: BETA_STRAIGHTEDGE_REST_CONFIG,
    chainId: "straightedge-2",
    chainName: "Straightedge",
    stakeCurrency: {
      coinDenom: "STR",
      coinMinimalDenom: "astr",
      coinDecimals: 18,
    },
    walletUrl:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/straightedge/stake"
        : "http://localhost:8081/#/straightedge/stake",
    walletUrlForStaking:
      process.env.NODE_ENV === "production"
        ? "https://wallet.keplr.app/#/straightedge/stake"
        : "http://localhost:8081/#/straightedge/stake",
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config("str"),
    currencies: [
      {
        coinDenom: "STR",
        coinMinimalDenom: "astr",
        coinDecimals: 18,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "STR",
        coinMinimalDenom: "astr",
        coinDecimals: 18,
      },
    ],
    coinType: 551,
    // STR's decimal is high. Thus, if gas price is set as 0.025, it produces very low and long fee.
    // And, currently, this long fee is not visible well in Keplr.
    // Just, increase the gas price step temporarily.
    gasPriceStep: {
      low: 0.01 * Math.pow(10, 12),
      average: 0.025 * Math.pow(10, 12),
      high: 0.04 * Math.pow(10, 12),
    },
    beta: true,
  },
];

// The origins that are able to pass any permission that external webpages can have.
export const PrivilegedOrigins: string[] = PRIVILEGED_ORIGINS;

export const FiatCurrencies: FiatCurrency[] = [
  {
    currency: "usd",
    symbol: "$",
    maxDecimals: 2,
    locale: "en-US",
  },
  {
    currency: "eur",
    symbol: "€",
    maxDecimals: 2,
    locale: "de-DE",
  },
  {
    currency: "gbp",
    symbol: "£",
    maxDecimals: 2,
    locale: "en-GB",
  },
  {
    currency: "cad",
    symbol: "CA$",
    maxDecimals: 2,
    locale: "en-CA",
  },
  {
    currency: "aud",
    symbol: "AU$",
    maxDecimals: 2,
    locale: "en-AU",
  },
  {
    currency: "rub",
    symbol: "₽",
    maxDecimals: 0,
    locale: "ru",
  },
  {
    currency: "krw",
    symbol: "₩",
    maxDecimals: 0,
    locale: "ko-KR",
  },
  {
    currency: "hkd",
    symbol: "HK$",
    maxDecimals: 1,
    locale: "en-HK",
  },
  {
    currency: "cny",
    symbol: "¥",
    maxDecimals: 1,
    locale: "zh-CN",
  },
  {
    currency: "jpy",
    symbol: "¥",
    maxDecimals: 0,
    locale: "ja-JP",
  },
];

export const LanguageToFiatCurrency: TypeLanguageToFiatCurrency = {
  default: "usd",
  ko: "krw",
};

export const AdditionalSignInPrepend:
  | RegisterOption[]
  | undefined = ADDITIONAL_SIGN_IN_PREPEND;

export const AdditonalIntlMessages: IntlMessages = ADDITIONAL_INTL_MESSAGES;
