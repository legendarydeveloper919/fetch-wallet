import { ExtensionKVStore } from "@keplr-wallet/common";
import {
  useAddressBookConfig,
  useIBCTransferConfig,
} from "@keplr-wallet/hooks";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { HeaderLayout } from "@layouts/index";
import { useStore } from "../../../stores";
import style from "./style.module.scss";
import { observer } from "mobx-react-lite";
import { ChatMember } from "@components/chat-member";
import {
  Group,
  GroupChatMemberOptions,
  GroupMembers,
  Groups,
  NewGroupDetails,
} from "@chatTypes";
import { createGroup } from "@graphQL/groups-api";
import { Button } from "reactstrap";
import { createEncryptedSymmetricKeyForAddresses } from "@utils/symmetric-key";
import { encryptGroupMessage, GroupMessageType } from "@utils/encrypt-group";
import { GroupChatPopup } from "@components/group-chat-popup";
import { useNotification } from "@components/notification";
import { createGroupEvent } from "@utils/group-events";
import { ChatErrorPopup } from "@components/chat-error-popup";

export const ReviewGroupChat: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const notification = useNotification();
  const {
    chainStore,
    accountStore,
    queriesStore,
    uiConfigStore,
    analyticsStore,
    chatStore,
  } = useStore();

  const newGroupState: NewGroupDetails = chatStore.newGroupStore.newGroup;
  const [selectedMembers, setSelectedMembers] = useState<GroupMembers[]>(
    newGroupState.group.members || []
  );
  const user = chatStore.userDetailsStore;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<any[]>([]);

  const groups: Groups = chatStore.messagesStore.userChatGroups;
  const group: Group = groups[newGroupState.group.groupId];

  const [selectedAddress, setSelectedAddresse] = useState<any>();
  const [confirmAction, setConfirmAction] = useState(false);

  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const walletAddress = accountInfo.bech32Address;

  // address book values
  const ibcTransferConfigs = useIBCTransferConfig(
    chainStore,
    queriesStore,
    accountStore,
    chainStore.current.chainId,
    accountInfo.bech32Address,
    {
      allowHexAddressOnEthermint: true,
      icns: uiConfigStore.icnsInfo,
    }
  );

  const [selectedChainId] = useState(
    ibcTransferConfigs.channelConfig?.channel
      ? ibcTransferConfigs.channelConfig.channel.counterpartyChainId
      : current.chainId
  );
  const addressBookConfig = useAddressBookConfig(
    new ExtensionKVStore("address-book"),
    chainStore,
    selectedChainId,
    {
      setRecipient: (): void => {
        // noop
      },
      setMemo: (): void => {
        // noop
      },
    }
  );

  useEffect(() => {
    const userAddresses: any[] = selectedMembers
      .reduce((acc: any[], element: GroupMembers) => {
        const addressData = addressBookConfig.addressBookDatas.find(
          (data) => data.address === element.address
        );
        if (addressData && addressData.address !== walletAddress) {
          return [
            ...acc,
            {
              name: addressData.name,
              address: addressData.address,
              existsInAddressBook: true,
            },
          ];
        } else {
          return element.address === walletAddress
            ? [
                {
                  name: "You",
                  address: walletAddress,
                  existsInAddressBook: false,
                },
                ...acc,
              ]
            : [
                ...acc,
                {
                  name: element.address,
                  address: element.address,
                  existsInAddressBook: false,
                },
              ];
        }
      }, [])
      .sort(function (a, b) {
        return b.address === walletAddress ? 0 : a.name.localeCompare(b.name);
      });
    setAddresses(userAddresses);
  }, [addressBookConfig.addressBookDatas, selectedMembers]);

  useEffect(() => {
    if (newGroupState.isEditGroup) {
      const groupData = Object.values(groups).find((group) =>
        group.id.includes(newGroupState.group.groupId)
      );
      if (groupData) {
        const updatedMembers: GroupMembers[] = groupData.addresses
          .filter((element) => !element.removedAt)
          .map((element) => {
            return {
              address: element.address,
              pubKey: element.pubKey,
              encryptedSymmetricKey: element.encryptedSymmetricKey,
              isAdmin: element.isAdmin,
            };
          });
        setSelectedMembers(updatedMembers);
        chatStore.newGroupStore.setNewGroupInfo({ members: updatedMembers });
      }
    }
  }, [groups, newGroupState.group.groupId, newGroupState.isEditGroup]);

  const handleRemoveMember = async (contactAddress: string) => {
    const tempAddresses = selectedMembers.filter(
      (item) => item.address !== contactAddress
    );
    chatStore.newGroupStore.setNewGroupInfo({ members: tempAddresses });
    setSelectedMembers(tempAddresses);
    setAddresses(addresses.filter((item) => item.address !== contactAddress));
  };

  const isUserAdmin = (address: string): boolean => {
    return (
      selectedMembers.find((element) => element.address === address)?.isAdmin ??
      false
    );
  };

  /// check login user is admin and part of group
  const isLoginUserAdmin = (): boolean => {
    const groupAddress = group?.addresses.find(
      (element) => element.address === walletAddress
    );
    if (groupAddress) {
      return groupAddress.isAdmin && !groupAddress.removedAt;
    }

    return false;
  };

  const AddContactOption = (address: string) => {
    analyticsStore.logEvent("add_new_address_click", {
      pageName: "Group Chat Review",
    });
    navigate("/setting/address-book", {
      state: {
        openModal: true,
        addressInputValue: address,
      },
    });
  };

  function showGroupPopup(address: any): void {
    if (address.address !== walletAddress) {
      setSelectedAddresse(address);
      setConfirmAction(true);
    }
  }

  function handlePopupAction(action: GroupChatMemberOptions) {
    setConfirmAction(false);

    if (!selectedAddress) {
      return;
    }

    switch (action) {
      case GroupChatMemberOptions.messageMember:
        analyticsStore.logEvent("dm_click", {
          pageName: "Group Chat Review",
        });
        navigate(`/chat/${selectedAddress.address}`);
        break;

      case GroupChatMemberOptions.addToAddressBook:
        AddContactOption(selectedAddress.address);
        break;

      case GroupChatMemberOptions.viewInAddressBook:
        analyticsStore.logEvent("address_book_click", {
          pageName: "Group Chat Review",
        });
        navigate("/setting/address-book");
        break;
    }
  }

  const createNewGroup = async () => {
    setIsLoading(true);
    const updatedGroupMembers = await createEncryptedSymmetricKeyForAddresses(
      newGroupState.group.members,
      current.chainId,
      user.accessToken
    );
    const userGroupAddress = updatedGroupMembers.find(
      (address) => address.address == accountInfo.bech32Address
    );
    const encryptedSymmetricKey = userGroupAddress?.encryptedSymmetricKey || "";
    const contents = await encryptGroupMessage(
      current.chainId,
      createGroupEvent(accountInfo.bech32Address),
      GroupMessageType.event,
      encryptedSymmetricKey,
      accountInfo.bech32Address,
      createGroupEvent(accountInfo.bech32Address),
      user.accessToken
    );

    const newGroupData = {
      ...newGroupState.group,
      members: updatedGroupMembers,
      contents,
    };
    const groupData = await createGroup(newGroupData, user.accessToken);
    setIsLoading(false);

    if (groupData) {
      chatStore.newGroupStore.resetNewGroup();
      const groups: any = { [groupData.id]: groupData };
      chatStore.messagesStore.setGroups(
        groups,
        chatStore.messagesStore.groupsPagination
      );
      /// Clearing stack till chat tab
      navigate(-4);
      setTimeout(() => {
        analyticsStore.logEvent("create_group_click");
        navigate(`/chat/group-chat-section/${groupData.id}`);
      }, 100);
    }
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={"New Group Chat"}
      onBackButton={() => {
        analyticsStore.logEvent("back_click", {
          pageName: "Group Chat Review",
        });
        navigate(-1);
      }}
    >
      <ChatErrorPopup />
      <div className={style["tokens"]}>
        <img
          className={style["groupImage"]}
          src={require("@assets/group710.svg")}
        />
        <span className={style["groupDescription"]}>
          {group?.name ?? newGroupState.group.name}
        </span>
        <span className={style["groupDescription"]}>
          {group?.description ?? newGroupState.group.description}
        </span>
        {newGroupState.isEditGroup && isUserAdmin(walletAddress) && (
          <Button
            className={style["button"]}
            size="large"
            onClick={async () => {
              analyticsStore.logEvent("edit_chat_settings_click");
              navigate("/chat/group-chat/edit-member");
            }}
          >
            Edit Chat Settings
          </Button>
        )}
      </div>
      <div className={style["membersContainer"]}>
        {
          <text className={style["memberText"]}>
            {addresses.length} member
            {addresses.length > 1 ? "s" : ""}
          </text>
        }

        {addresses.map((address: any) => {
          return (
            <ChatMember
              address={address}
              key={address.address}
              /// showSelectedIcon: isEditGroup true means remove the cross icon
              showSelectedIcon={!newGroupState.isEditGroup}
              isSelected={true}
              isShowAdmin={isUserAdmin(address.address)}
              showPointer
              onClick={() => showGroupPopup(address)}
              onIconClick={() => {
                handleRemoveMember(address.address);
              }}
            />
          );
        })}
      </div>
      {!newGroupState.isEditGroup && (
        <Button
          className={style["button"]}
          size="large"
          data-loading={isLoading}
          onClick={() => {
            if (selectedMembers.length > 1) {
              createNewGroup();
            } else {
              notification.push({
                type: "warning",
                placement: "top-center",
                duration: 5,
                content: `At least 2 members must be selected`,
                canDelete: true,
                transition: {
                  duration: 0.25,
                },
              });
            }
          }}
        >
          Create Group Chat
        </Button>
      )}
      {confirmAction && !isUserAdmin(walletAddress) && (
        /// Display popup for non admin member
        <GroupChatPopup
          isAdded={selectedAddress.existsInAddressBook}
          isFromReview={true}
          name={selectedAddress?.name ?? ""}
          selectedMember={selectedMembers.find(
            (element) => element.address === selectedAddress?.address
          )}
          isLoginUserAdmin={isLoginUserAdmin()}
          onClick={(action) => {
            handlePopupAction(action);
          }}
        />
      )}
    </HeaderLayout>
  );
});
