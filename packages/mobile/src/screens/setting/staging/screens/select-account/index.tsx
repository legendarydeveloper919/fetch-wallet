import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../../stores";
import { PageWithScrollView } from "../../../../../components/staging/page";
import { SettingItem } from "../../components";
import Svg, { Path } from "react-native-svg";
import { useSmartNavigation } from "../../../../../navigation";
import { BorderlessButton } from "react-native-gesture-handler";
import FeatherIcon from "react-native-vector-icons/Feather";

const CheckIcon: FunctionComponent = () => {
  return (
    <Svg width="19" height="17" fill="none" viewBox="0 0 19 17">
      <Path
        stroke="#4762E7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M18 1L7.448 16 1 7.923"
      />
    </Svg>
  );
};

export const SettingSelectAccountScreenHeaderRight: FunctionComponent<{
  tintColor?: string;
}> = ({ tintColor }) => {
  const smartNavigation = useSmartNavigation();

  return (
    <BorderlessButton
      onPress={() => {
        smartNavigation.navigateSmart("Register.Intro", {});
      }}
    >
      <FeatherIcon name="plus" color={tintColor} size={24} />
    </BorderlessButton>
  );
};

export const SettingSelectAccountScreen: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  return (
    <PageWithScrollView>
      {keyRingStore.multiKeyStoreInfo.map((keyStore, i) => {
        const name =
          (keyStore.meta ? keyStore.meta["name"] : undefined) ??
          "Keplr Account";

        return (
          <SettingItem
            key={i.toString()}
            label={name}
            right={keyStore.selected ? <CheckIcon /> : undefined}
            onPress={() => {
              if (!keyStore.selected) {
                keyRingStore.changeKeyRing(i);
              }
            }}
          />
        );
      })}
    </PageWithScrollView>
  );
});
