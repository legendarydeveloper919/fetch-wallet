import { AccountSetBase, AccountSetOpts, MsgOpt } from "./base";
import { AppCurrency } from "@keplr-wallet/types";
import { StdFee } from "@cosmjs/launchpad";
import { DenomHelper } from "@keplr-wallet/common";
import { Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { ChainIdHelper } from "@keplr-wallet/cosmos";
import { BondStatus } from "../query/cosmos/staking/types";
import { HasCosmosQueries, QueriesSetBase, QueriesStore } from "../query";
import { DeepReadonly } from "utility-types";
import { ChainGetter } from "../common";

export interface HasCosmosAccount {
  cosmos: DeepReadonly<CosmosAccount>;
}

export interface CosmosMsgOpts {
  readonly send: {
    readonly native: MsgOpt;
  };
  readonly ibcTransfer: MsgOpt;
  readonly delegate: MsgOpt;
  readonly undelegate: MsgOpt;
  readonly redelegate: MsgOpt;
  // The gas multiplication per rewards.
  readonly withdrawRewards: MsgOpt;
  readonly govVote: MsgOpt;
}

export class AccountWithCosmos
  extends AccountSetBase<CosmosMsgOpts, HasCosmosQueries>
  implements HasCosmosAccount {
  public readonly cosmos: DeepReadonly<CosmosAccount>;

  static readonly defaultMsgOpts: CosmosMsgOpts = {
    send: {
      native: {
        type: "cosmos-sdk/MsgSend",
        gas: 80000,
      },
    },
    ibcTransfer: {
      type: "cosmos-sdk/MsgTransfer",
      gas: 120000,
    },
    delegate: {
      type: "cosmos-sdk/MsgDelegate",
      gas: 250000,
    },
    undelegate: {
      type: "cosmos-sdk/MsgUndelegate",
      gas: 250000,
    },
    redelegate: {
      type: "cosmos-sdk/MsgBeginRedelegate",
      gas: 250000,
    },
    // The gas multiplication per rewards.
    withdrawRewards: {
      type: "cosmos-sdk/MsgWithdrawDelegationReward",
      gas: 140000,
    },
    govVote: {
      type: "cosmos-sdk/MsgVote",
      gas: 250000,
    },
  };

  constructor(
    protected readonly eventListener: {
      addEventListener: (type: string, fn: () => unknown) => void;
      removeEventListener: (type: string, fn: () => unknown) => void;
    },
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<
      QueriesSetBase & HasCosmosQueries
    >,
    protected readonly opts: AccountSetOpts<CosmosMsgOpts>
  ) {
    super(eventListener, chainGetter, chainId, queriesStore, opts);

    this.cosmos = new CosmosAccount(this, chainGetter, chainId, queriesStore);
  }
}

export class CosmosAccount {
  constructor(
    protected readonly base: AccountSetBase<CosmosMsgOpts, HasCosmosQueries>,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore<
      QueriesSetBase & HasCosmosQueries
    >
  ) {
    this.base.registerSendTokenFn(this.processSendToken.bind(this));
  }

  protected async processSendToken(
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string,
    stdFee: Partial<StdFee>,
    onFulfill?: (tx: any) => void
  ): Promise<boolean> {
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);

    switch (denomHelper.type) {
      case "native":
        const actualAmount = (() => {
          let dec = new Dec(amount);
          dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
          return dec.truncate().toString();
        })();

        await this.base.sendMsgs(
          "send",
          [
            {
              type: this.base.msgOpts.send.native.type,
              value: {
                from_address: this.base.bech32Address,
                to_address: recipient,
                amount: [
                  {
                    denom: currency.coinMinimalDenom,
                    amount: actualAmount,
                  },
                ],
              },
            },
          ],
          {
            amount: stdFee.amount ?? [],
            gas: stdFee.gas ?? this.base.msgOpts.send.native.gas.toString(),
          },
          memo,
          (tx) => {
            if (tx.code == null || tx.code === 0) {
              // After succeeding to send token, refresh the balance.
              const queryBalance = this.queries.queryBalances
                .getQueryBech32Address(this.base.bech32Address)
                .balances.find((bal) => {
                  return (
                    bal.currency.coinMinimalDenom === currency.coinMinimalDenom
                  );
                });

              if (queryBalance) {
                queryBalance.fetch();
              }
            }

            if (onFulfill) {
              onFulfill(tx);
            }
          }
        );
        return true;
    }

    return false;
  }

  async sendIBCTransferMsg(
    channel: {
      portId: string;
      channelId: string;
      counterpartyChainId: string;
    },
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    onFulfill?: (tx: any) => void
  ) {
    if (new DenomHelper(currency.coinMinimalDenom).type !== "native") {
      throw new Error("Only native token can be sent via IBC");
    }

    const actualAmount = (() => {
      let dec = new Dec(amount);
      dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
      return dec.truncate().toString();
    })();

    const destinationBlockHeight = this.queriesStore
      .get(channel.counterpartyChainId)
      .cosmos.queryBlock.getBlock("latest");

    await this.base.sendMsgs(
      "ibcTransfer",
      async () => {
        // Wait until fetching complete.
        await destinationBlockHeight.waitFreshResponse();

        if (destinationBlockHeight.height.equals(new Int("0"))) {
          throw new Error(
            `Failed to fetch the latest block of ${channel.counterpartyChainId}`
          );
        }

        const msg = {
          type: this.base.msgOpts.ibcTransfer.type,
          value: {
            source_port: channel.portId,
            source_channel: channel.channelId,
            token: {
              denom: currency.coinMinimalDenom,
              amount: actualAmount,
            },
            sender: this.base.bech32Address,
            receiver: recipient,
            timeout_height: {
              revision_number: ChainIdHelper.parse(
                channel.counterpartyChainId
              ).version.toString() as string | undefined,
              // Set the timeout height as the current height + 150.
              revision_height: destinationBlockHeight.height
                .add(new Int("150"))
                .toString(),
            },
          },
        };

        if (msg.value.timeout_height.revision_number === "0") {
          delete msg.value.timeout_height.revision_number;
        }

        return [msg];
      },
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this.base.msgOpts.ibcTransfer.gas.toString(),
      },
      memo,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to send token, refresh the balance.
          const queryBalance = this.queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.find((bal) => {
              return (
                bal.currency.coinMinimalDenom === currency.coinMinimalDenom
              );
            });

          if (queryBalance) {
            queryBalance.fetch();
          }
        }

        if (onFulfill) {
          onFulfill(tx);
        }
      }
    );
  }

  /**
   * Send `MsgDelegate` msg to the chain.
   * @param amount Decimal number used by humans.
   *               If amount is 0.1 and the stake currenct is uatom, actual amount will be changed to the 100000uatom.
   * @param validatorAddress
   * @param memo
   * @param onFulfill
   */
  async sendDelegateMsg(
    amount: string,
    validatorAddress: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    onFulfill?: (tx: any) => void
  ) {
    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getPrecisionDec(currency.coinDecimals));

    const msg = {
      type: this.base.msgOpts.delegate.type,
      value: {
        delegator_address: this.base.bech32Address,
        validator_address: validatorAddress,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };

    await this.base.sendMsgs(
      "delegate",
      [msg],
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this.base.msgOpts.delegate.gas.toString(),
      },
      memo,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to delegate, refresh the validators and delegations, rewards.
          this.queries.cosmos.queryValidators
            .getQueryStatus(BondStatus.Bonded)
            .fetch();
          this.queries.cosmos.queryDelegations
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }

        if (onFulfill) {
          onFulfill(tx);
        }
      }
    );
  }

  /**
   * Send `MsgUndelegate` msg to the chain.
   * @param amount Decimal number used by humans.
   *               If amount is 0.1 and the stake currenct is uatom, actual amount will be changed to the 100000uatom.
   * @param validatorAddress
   * @param memo
   * @param onFulfill
   */
  async sendUndelegateMsg(
    amount: string,
    validatorAddress: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    onFulfill?: (tx: any) => void
  ) {
    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getPrecisionDec(currency.coinDecimals));

    const msg = {
      type: this.base.msgOpts.undelegate.type,
      value: {
        delegator_address: this.base.bech32Address,
        validator_address: validatorAddress,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };

    await this.base.sendMsgs(
      "undelegate",
      [msg],
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this.base.msgOpts.undelegate.gas.toString(),
      },
      memo,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to unbond, refresh the validators and delegations, unbonding delegations, rewards.
          this.queries.cosmos.queryValidators
            .getQueryStatus(BondStatus.Bonded)
            .fetch();
          this.queries.cosmos.queryDelegations
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
          this.queries.cosmos.queryUnbondingDelegations
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }

        if (onFulfill) {
          onFulfill(tx);
        }
      }
    );
  }

  /**
   * Send `MsgBeginRedelegate` msg to the chain.
   * @param amount Decimal number used by humans.
   *               If amount is 0.1 and the stake currenct is uatom, actual amount will be changed to the 100000uatom.
   * @param srcValidatorAddress
   * @param dstValidatorAddress
   * @param memo
   * @param onFulfill
   */
  async sendBeginRedelegateMsg(
    amount: string,
    srcValidatorAddress: string,
    dstValidatorAddress: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    onFulfill?: (tx: any) => void
  ) {
    const currency = this.chainGetter.getChain(this.chainId).stakeCurrency;

    let dec = new Dec(amount);
    dec = dec.mulTruncate(DecUtils.getPrecisionDec(currency.coinDecimals));

    const msg = {
      type: this.base.msgOpts.redelegate.type,
      value: {
        delegator_address: this.base.bech32Address,
        validator_src_address: srcValidatorAddress,
        validator_dst_address: dstValidatorAddress,
        amount: {
          denom: currency.coinMinimalDenom,
          amount: dec.truncate().toString(),
        },
      },
    };

    await this.base.sendMsgs(
      "redelegate",
      [msg],
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this.base.msgOpts.redelegate.gas.toString(),
      },
      memo,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to redelegate, refresh the validators and delegations, rewards.
          this.queries.cosmos.queryValidators
            .getQueryStatus(BondStatus.Bonded)
            .fetch();
          this.queries.cosmos.queryDelegations
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }

        if (onFulfill) {
          onFulfill(tx);
        }
      }
    );
  }

  async sendWithdrawDelegationRewardMsgs(
    validatorAddresses: string[],
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    onFulfill?: (tx: any) => void
  ) {
    const msgs = validatorAddresses.map((validatorAddress) => {
      return {
        type: this.base.msgOpts.withdrawRewards.type,
        value: {
          delegator_address: this.base.bech32Address,
          validator_address: validatorAddress,
        },
      };
    });

    await this.base.sendMsgs(
      "withdrawRewards",
      msgs,
      {
        amount: stdFee.amount ?? [],
        gas:
          stdFee.gas ??
          (
            this.base.msgOpts.withdrawRewards.gas * validatorAddresses.length
          ).toString(),
      },
      memo,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to withdraw rewards, refresh rewards.
          this.queries.cosmos.queryRewards
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();
        }

        if (onFulfill) {
          onFulfill(tx);
        }
      }
    );
  }

  async sendGovVoteMsg(
    proposalId: string,
    option: "Yes" | "No" | "Abstain" | "NoWithVeto",
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    onFulfill?: (tx: any) => void
  ) {
    const voteOption = (() => {
      if (
        this.chainGetter.getChain(this.chainId).features?.includes("stargate")
      ) {
        switch (option) {
          case "Yes":
            return 1;
          case "Abstain":
            return 2;
          case "No":
            return 3;
          case "NoWithVeto":
            return 4;
        }
      } else {
        return option;
      }
    })();

    const msg = {
      type: this.base.msgOpts.govVote.type,
      value: {
        option: voteOption,
        proposal_id: proposalId,
        voter: this.base.bech32Address,
      },
    };

    await this.base.sendMsgs(
      "govVote",
      [msg],
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this.base.msgOpts.govVote.gas.toString(),
      },
      memo,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // After succeeding to vote, refresh the proposal.
          const proposal = this.queries.cosmos.queryGovernance.proposals.find(
            (proposal) => proposal.id === proposalId
          );
          if (proposal) {
            proposal.fetch();
          }
        }

        if (onFulfill) {
          onFulfill(tx);
        }
      }
    );
  }

  protected get queries(): DeepReadonly<QueriesSetBase & HasCosmosQueries> {
    return this.queriesStore.get(this.chainId);
  }
}
