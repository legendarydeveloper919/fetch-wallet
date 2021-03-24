import { inject, singleton, delay } from "tsyringe";
import { TYPES } from "../types";

import { ChainInfo } from "@keplr-wallet/types";
import Axios from "axios";
import { KVStore } from "@keplr-wallet/common";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { ChainsService } from "../chains";

@singleton()
export class ChainUpdaterService {
  constructor(
    @inject(TYPES.UpdaterStore) protected readonly kvStore: KVStore,
    @inject(delay(() => ChainsService))
    protected readonly chainsService: ChainsService
  ) {}

  async putUpdatedPropertyToChainInfo(
    chainInfo: ChainInfo
  ): Promise<ChainInfo> {
    const updatedProperty = await this.getUpdatedChainProperty(
      chainInfo.chainId
    );

    const chainId = ChainIdHelper.parse(chainInfo.chainId);
    const updatedChainId = ChainIdHelper.parse(
      updatedProperty.chainId || chainInfo.chainId
    );

    // If the saved property is lesser than the current chain id, just ignore.
    if (updatedChainId.version < chainId.version) {
      return chainInfo;
    }

    const features = chainInfo.features ?? [];
    for (const updatedFeature of updatedProperty.features ?? []) {
      if (!features.includes(updatedFeature)) {
        features.push(updatedFeature);
      }
    }

    return {
      ...chainInfo,
      ...{
        chainId: updatedProperty.chainId || chainInfo.chainId,
        features,
      },
    };
  }

  async clearUpdatedProperty(chainId: string) {
    await this.kvStore.set(ChainIdHelper.parse(chainId).identifier, null);
  }

  async tryUpdateChain(chainId: string) {
    const chainInfo = await this.chainsService.getChainInfo(chainId);

    // If chain id is not fomatted as {chainID}-{version},
    // there is no way to deal with the updated chain id.
    if (!ChainIdHelper.hasChainVersion(chainInfo.chainId)) {
      return chainInfo.chainId;
    }

    const instance = Axios.create({
      baseURL: chainInfo.rpc,
    });

    // Get the latest block.
    const result = await instance.get<{
      result: {
        block: {
          header: {
            chain_id: string;
          };
        };
      };
    }>("/block");

    const currentVersion = ChainIdHelper.parse(chainInfo.chainId);
    const fetchedChainId = result.data.result.block.header.chain_id;
    const fetchedVersion = ChainIdHelper.parse(fetchedChainId);

    if (
      currentVersion.identifier === fetchedVersion.identifier &&
      currentVersion.version < fetchedVersion.version
    ) {
      await this.saveChainProperty(currentVersion.identifier, {
        chainId: fetchedChainId,
      });
    }

    let staragteUpdate = false;
    try {
      if (!chainInfo.features || !chainInfo.features.includes("stargate")) {
        const restInstance = Axios.create({
          baseURL: chainInfo.rest,
        });

        // If the chain doesn't have the stargate feature,
        // but it can use the GRPC HTTP Gateway,
        // assume that it can support the stargate and try to update the features.
        await restInstance.get("/cosmos/base/tendermint/v1beta1/node_info");

        const savedChainProperty = await this.getUpdatedChainProperty(
          chainInfo.chainId
        );

        await this.saveChainProperty(currentVersion.identifier, {
          features: (savedChainProperty.features ?? []).concat(["stargate"]),
        });
        staragteUpdate = true;
      }
    } catch {}

    try {
      if (
        (!chainInfo.features || !chainInfo.features.includes("ibc-transfer")) &&
        (staragteUpdate ||
          (chainInfo.features && chainInfo.features.includes("stargate")))
      ) {
        const restInstance = Axios.create({
          baseURL: chainInfo.rest,
        });

        // If the chain doesn't have the ibc transfer feature,
        // try to fetch the params of ibc transfer module.
        // assume that it can support the ibc transfer if the params return true, and try to update the features.
        const result = await restInstance.get<{
          params: {
            receive_enabled: boolean;
            send_enabled: boolean;
          };
        }>("/ibc/applications/transfer/v1beta1/params");
        if (
          result.data.params.receive_enabled &&
          result.data.params.send_enabled
        ) {
          const savedChainProperty = await this.getUpdatedChainProperty(
            chainInfo.chainId
          );

          await this.saveChainProperty(currentVersion.identifier, {
            features: (savedChainProperty.features ?? []).concat([
              "ibc-transfer",
            ]),
          });
        }
      }
    } catch {}
  }

  private async getUpdatedChainProperty(
    chainId: string
  ): Promise<Partial<ChainInfo>> {
    const version = ChainIdHelper.parse(chainId);

    return await this.loadChainProperty(version.identifier);
  }

  private async saveChainProperty(
    identifier: string,
    chainInfo: Partial<ChainInfo>
  ) {
    const saved = await this.loadChainProperty(identifier);

    await this.kvStore.set(identifier, {
      ...saved,
      ...chainInfo,
    });
  }

  private async loadChainProperty(
    identifier: string
  ): Promise<Partial<ChainInfo>> {
    const chainInfo = await this.kvStore.get<Partial<ChainInfo>>(identifier);
    if (!chainInfo) return {};
    return chainInfo;
  }

  /**
   * Returns wether the chain has been changed.
   * Currently, only check the chain id has been changed.
   * @param chainInfo Chain information.
   */
  public static async checkChainUpdate(
    chainInfo: Readonly<ChainInfo>
  ): Promise<{
    explicit: boolean;
    slient: boolean;
  }> {
    const chainId = chainInfo.chainId;

    // If chain id is not fomatted as {chainID}-{version},
    // there is no way to deal with the updated chain id.
    if (!ChainIdHelper.hasChainVersion(chainId)) {
      return {
        explicit: false,
        slient: false,
      };
    }

    const instance = Axios.create({
      baseURL: chainInfo.rpc,
    });

    // Get the latest block.
    const result = await instance.get<{
      result: {
        block: {
          header: {
            chain_id: string;
          };
        };
      };
    }>("/block");

    const resultChainId = result.data.result.block.header.chain_id;

    const version = ChainIdHelper.parse(chainId);
    const fetchedVersion = ChainIdHelper.parse(resultChainId);

    // TODO: Should throw an error?
    if (version.identifier !== fetchedVersion.identifier) {
      return {
        explicit: false,
        slient: false,
      };
    }

    let staragteUpdate = false;
    try {
      if (!chainInfo.features || !chainInfo.features.includes("stargate")) {
        const restInstance = Axios.create({
          baseURL: chainInfo.rest,
        });

        // If the chain doesn't have the stargate feature,
        // but it can use the GRPC HTTP Gateway,
        // assume that it can support the stargate and try to update the features.
        await restInstance.get("/cosmos/base/tendermint/v1beta1/node_info");
        staragteUpdate = true;
      }
    } catch {}

    let ibcTransferUpdate = false;
    try {
      if (
        (!chainInfo.features || !chainInfo.features.includes("ibc-transfer")) &&
        (staragteUpdate ||
          (chainInfo.features && chainInfo.features.includes("stargate")))
      ) {
        const restInstance = Axios.create({
          baseURL: chainInfo.rest,
        });

        // If the chain doesn't have the ibc transfer feature,
        // try to fetch the params of ibc transfer module.
        // assume that it can support the ibc transfer if the params return true, and try to update the features.
        const result = await restInstance.get<{
          params: {
            receive_enabled: boolean;
            send_enabled: boolean;
          };
        }>("/ibc/applications/transfer/v1beta1/params");
        if (
          result.data.params.receive_enabled &&
          result.data.params.send_enabled
        ) {
          ibcTransferUpdate = true;
        }
      }
    } catch {}

    return {
      explicit: version.version < fetchedVersion.version,
      slient: staragteUpdate || ibcTransferUpdate,
    };
  }
}
