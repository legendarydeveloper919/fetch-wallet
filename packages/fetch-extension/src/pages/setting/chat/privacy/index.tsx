import { RegisterPublicKey } from "@keplr-wallet/background/build/messaging";
import { PrivacySetting } from "@keplr-wallet/background/build/messaging/types";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import { InExtensionMessageRequester } from "@keplr-wallet/router-extension";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { useLoadingIndicator } from "@components/loading-indicator";
import { HeaderLayout } from "@layouts/index";
import { useStore } from "../../../../stores";
import { PageButton } from "../../page-button";
import style from "./style.module.scss";
import { GRAPHQL_URL } from "../../../../config.ui.var";

export const Privacy: FunctionComponent = observer(() => {
  // const language = useLanguage();
  const navigate = useNavigate();
  const intl = useIntl();
  const { chainStore, accountStore, analyticsStore, chatStore } = useStore();

  const walletAddress = accountStore.getAccount(
    chainStore.current.chainId
  ).bech32Address;

  const userState = chatStore.userDetailsStore;

  const [selectedPrivacySetting, setSelectedPrivacySetting] =
    useState<PrivacySetting>(
      userState?.messagingPubKey.privacySetting
        ? userState?.messagingPubKey.privacySetting
        : PrivacySetting.Everybody
    );

  const loadingIndicator = useLoadingIndicator();

  const requester = new InExtensionMessageRequester();

  const updatePrivacy = async (setting: PrivacySetting) => {
    loadingIndicator.setIsLoading("privacy", true);
    try {
      const messagingPubKey = await requester.sendMessage(
        BACKGROUND_PORT,
        new RegisterPublicKey(
          GRAPHQL_URL.MESSAGING_SERVER,
          chainStore.current.chainId,
          userState.accessToken,
          walletAddress,
          setting
        )
      );
      chatStore.userDetailsStore.setMessagingPubKey(messagingPubKey);
      setSelectedPrivacySetting(setting);
    } catch (e) {
      // Show error toaster
      console.error("error", e);
    } finally {
      loadingIndicator.setIsLoading("privacy", false);
    }
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.privacy",
      })}
      onBackButton={() => {
        analyticsStore.logEvent("back_click", {
          pageName: "Setting & Privacy",
        });
        navigate(-1);
      }}
    >
      <div className={style["container"]}>
        <PageButton
          title="Everybody"
          onClick={(e) => {
            e.preventDefault();
            updatePrivacy(PrivacySetting.Everybody);
            analyticsStore.logEvent("chat_privacy_click", {
              action: PrivacySetting.Everybody,
            });
          }}
          icons={useMemo(
            () =>
              selectedPrivacySetting === PrivacySetting.Everybody
                ? [
                    <img
                      key={0}
                      src={require("@assets/svg/tick-icon.svg")}
                      style={{ width: "100%" }}
                      alt="message"
                    />,
                  ]
                : [],
            [selectedPrivacySetting]
          )}
        />
        <PageButton
          title="Contacts"
          onClick={(e) => {
            e.preventDefault();
            updatePrivacy(PrivacySetting.Contacts);
            analyticsStore.logEvent("chat_privacy_click", {
              action: PrivacySetting.Contacts,
            });
          }}
          icons={useMemo(
            () =>
              selectedPrivacySetting === PrivacySetting.Contacts
                ? [
                    <img
                      key={0}
                      src={require("@assets/svg/tick-icon.svg")}
                      style={{ width: "100%" }}
                      alt="message"
                    />,
                  ]
                : [],
            [selectedPrivacySetting]
          )}
        />
        <PageButton
          title="Nobody"
          onClick={(e) => {
            e.preventDefault();
            updatePrivacy(PrivacySetting.Nobody);
            analyticsStore.logEvent("chat_privacy_click", {
              action: PrivacySetting.Nobody,
            });
          }}
          icons={useMemo(
            () =>
              selectedPrivacySetting === PrivacySetting.Nobody
                ? [
                    <img
                      key={0}
                      src={require("@assets/svg/tick-icon.svg")}
                      style={{ width: "100%" }}
                      alt="message"
                    />,
                  ]
                : [],
            [selectedPrivacySetting]
          )}
        />
      </div>
    </HeaderLayout>
  );
});
