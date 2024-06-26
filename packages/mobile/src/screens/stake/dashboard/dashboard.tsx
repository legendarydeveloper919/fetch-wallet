import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/page";
import { MyRewardCard } from "./reward-card";
import { DelegationsCard } from "./delegations-card";
import { UndelegationsCard } from "./undelegations-card";
import { useStyle } from "../../../styles";
import { useStore } from "../../../stores";
import { ViewStyle } from "react-native";

export const StakingDashboardScreen: FunctionComponent = () => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const style = useStyle();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const unbondings =
    queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
      account.bech32Address
    ).unbondingBalances;

  return (
    <PageWithScrollView backgroundMode="gradient">
      <MyRewardCard
        containerStyle={style.flatten(["margin-y-card-gap"]) as ViewStyle}
      />
      <DelegationsCard
        containerStyle={style.flatten(["margin-bottom-card-gap"]) as ViewStyle}
      />
      {unbondings.length > 0 ? (
        <UndelegationsCard
          containerStyle={
            style.flatten(["margin-bottom-card-gap"]) as ViewStyle
          }
        />
      ) : null}
    </PageWithScrollView>
  );
};
