import React, { FunctionComponent, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { useStore } from "../../../stores";
import { EthereumEndpoint } from "../../../config";
import { PageWithScrollView } from "../../../components/staging/page";
import { View } from "react-native";
import {
  AddressInput,
  AmountInput,
  MemoInput,
  CurrencySelector,
  FeeButtons,
} from "../../../components/staging/input";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/staging/button";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSmartNavigation } from "../../../navigation";
import { Buffer } from "buffer/";

export const SendScreen: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          currency?: string;
          recipient?: string;
        }
      >,
      string
    >
  >();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const chainId = route.params.chainId
    ? route.params.chainId
    : chainStore.current.chainId;

  const account = accountStore.getAccount(chainId);
  const queries = queriesStore.get(chainId);

  const sendConfigs = useSendTxConfig(
    chainStore,
    chainId,
    account.msgOpts["send"],
    account.bech32Address,
    queries.queryBalances,
    EthereumEndpoint
  );

  useEffect(() => {
    if (route.params.currency) {
      const currency = sendConfigs.amountConfig.sendableCurrencies.find(
        (cur) => cur.coinMinimalDenom === route.params.currency
      );
      if (currency) {
        sendConfigs.amountConfig.setSendCurrency(currency);
      }
    }
  }, [route.params.currency, sendConfigs.amountConfig]);

  useEffect(() => {
    if (route.params.recipient) {
      sendConfigs.recipientConfig.setRawRecipient(route.params.recipient);
    }
  }, [route.params.recipient, sendConfigs.recipientConfig]);

  const sendConfigError =
    sendConfigs.recipientConfig.getError() ??
    sendConfigs.amountConfig.getError() ??
    sendConfigs.memoConfig.getError() ??
    sendConfigs.gasConfig.getError() ??
    sendConfigs.feeConfig.getError();
  const txStateIsValid = sendConfigError == null;

  return (
    <PageWithScrollView
      style={style.flatten(["padding-page"])}
      contentContainerStyle={style.get("flex-grow-1")}
    >
      <AddressInput
        label="Recipient"
        recipientConfig={sendConfigs.recipientConfig}
        memoConfig={sendConfigs.memoConfig}
      />
      <CurrencySelector
        label="Token"
        placeHolder="Select Token"
        amountConfig={sendConfigs.amountConfig}
      />
      <AmountInput label="Amount" amountConfig={sendConfigs.amountConfig} />
      <MemoInput label="Memo (Optional)" memoConfig={sendConfigs.memoConfig} />
      <FeeButtons
        label="Fee"
        gasLabel="gas"
        feeConfig={sendConfigs.feeConfig}
        gasConfig={sendConfigs.gasConfig}
      />
      <View style={style.flatten(["flex-1"])} />
      <Button
        text="Send"
        size="large"
        disabled={!account.isReadyToSendMsgs || !txStateIsValid}
        loading={account.isSendingMsg === "send"}
        onPress={async () => {
          if (account.isReadyToSendMsgs && txStateIsValid) {
            // TODO: Notify the result.
            try {
              await account.sendToken(
                sendConfigs.amountConfig.amount,
                sendConfigs.amountConfig.sendCurrency,
                sendConfigs.recipientConfig.recipient,
                sendConfigs.memoConfig.memo,
                {},
                {
                  onBroadcasted: (txHash) => {
                    smartNavigation.pushSmart("TxPendingResult", {
                      txHash: Buffer.from(txHash).toString("hex"),
                    });
                  },
                }
              );
            } catch (e) {
              console.log(e);
              smartNavigation.navigateSmart("Home", {});
            }
          }
        }}
      />
    </PageWithScrollView>
  );
});
