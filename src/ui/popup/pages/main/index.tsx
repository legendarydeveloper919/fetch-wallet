import React, { FunctionComponent } from "react";

import { HeaderLayout } from "../../layouts";

import style from "./style.module.scss";
import { Menu } from "./menu";
import { AccountView } from "./account";
import { TxButtonView } from "./tx-button";
import { AssetView } from "./asset";
import { StakeView } from "./stake";

export const MainPage: FunctionComponent = () => {
  return (
    <HeaderLayout showChainName canChangeChainInfo menuRenderer={<Menu />}>
      <div className={style.containerCard}>
        <div className={style.containerAccountInner}>
          <AccountView />
          <AssetView />
          <TxButtonView />
        </div>
      </div>
      <div className={style.containerCard}>
        <StakeView />
      </div>
    </HeaderLayout>
  );
};
