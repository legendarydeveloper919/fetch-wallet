/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useNavigate } from "react-router";
import { HeaderLayout } from "@layouts/index";
import { Menu } from "../../pages/main/menu";
import { SwitchUser } from "../switch-user";
import style from "./style.module.scss";

export const DeactivatedChat = () => {
  const navigate = useNavigate();

  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={true}
      menuRenderer={<Menu />}
      rightRenderer={<SwitchUser />}
    >
      <div className={style["lockedInnerContainer"]}>
        <img
          className={style["imgLock"]}
          src={require("@assets/img/icons8-lock.svg")}
          alt="lock"
        />

        <div style={{ marginTop: "25px" }}>
          Chat is <b>deactivated</b> based on your current chat privacy
          settings. Please change your chat privacy settings to use this
          feature.
        </div>
        <br />
        <a
          href="#"
          draggable={false}
          style={{
            textDecoration: "underline",
          }}
          onClick={(e) => {
            e.preventDefault();
            navigate("/setting/chat/privacy");
          }}
        >
          Go to chat privacy settings
        </a>
      </div>
    </HeaderLayout>
  );
};
