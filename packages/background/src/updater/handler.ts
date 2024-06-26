import { Env, Handler, InternalHandler, Message } from "@keplr-wallet/router";
import { ChainUpdaterService } from "./service";
import {
  ResetChainEndpointsMsg,
  SetChainEndpointsMsg,
  TryUpdateChainMsg,
} from "./messages";

export const getHandler: (service: ChainUpdaterService) => Handler = (
  service
) => {
  return (env: Env, msg: Message<unknown>) => {
    switch (msg.constructor) {
      case TryUpdateChainMsg:
        return handleTryUpdateChainMsg(service)(env, msg as TryUpdateChainMsg);
      case SetChainEndpointsMsg:
        return handleSetChainEndpointsMsg(service)(
          env,
          msg as SetChainEndpointsMsg
        );
      case ResetChainEndpointsMsg:
        return handleResetChainEndpointsMsg(service)(
          env,
          msg as ResetChainEndpointsMsg
        );
      default:
        throw new Error("Unknown msg type");
    }
  };
};

const handleTryUpdateChainMsg: (
  service: ChainUpdaterService
) => InternalHandler<TryUpdateChainMsg> = (service) => {
  return async (_, msg) => {
    const updated = await service.tryUpdateChainInfo(msg.chainId);
    return {
      updated,
      afterChainInfos: await service.chainsService.getChainInfos(),
    };
  };
};

const handleSetChainEndpointsMsg: (
  service: ChainUpdaterService
) => InternalHandler<SetChainEndpointsMsg> = (service) => {
  return async (_, msg) => {
    return await service.setChainEndpoints(msg.chainId, msg.rpc, msg.rest);
  };
};

const handleResetChainEndpointsMsg: (
  service: ChainUpdaterService
) => InternalHandler<ResetChainEndpointsMsg> = (service) => {
  return async (_, msg) => {
    return await service.resetChainEndpoints(msg.chainId);
  };
};
