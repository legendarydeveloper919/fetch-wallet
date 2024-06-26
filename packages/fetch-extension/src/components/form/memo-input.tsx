import React, { FunctionComponent, useMemo, useState } from "react";
import { FormFeedback, FormGroup, Input, Label } from "reactstrap";
import { IMemoConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";

export interface MemoInputProps {
  memoConfig: IMemoConfig;

  label?: string;
  className?: string;

  rows?: number;

  disabled?: boolean;
}

// TODO: Handle the max memo bytes length for each chain.
export const MemoInput: FunctionComponent<MemoInputProps> = observer(
  ({ memoConfig, label, className, rows, disabled = false }) => {
    const [inputId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return `input-${Buffer.from(bytes).toString("hex")}`;
    });

    const error = memoConfig.error;
    const errorText: string | undefined = useMemo(() => {
      if (error) {
        switch (error.constructor) {
          default:
            return error.message;
        }
      }
    }, [error]);

    return (
      <FormGroup className={className}>
        {label ? (
          <Label for={inputId} className="form-control-label">
            {label}
          </Label>
        ) : null}

        <Input
          id={inputId}
          className="form-control-alternative"
          type="textarea"
          rows={rows ? rows : 2}
          style={{
            resize: "none",
            boxShadow: "0 3px 3px rgb(50 50 93 / 15%), 0 1px 0 rgb(0 0 0 / 2%)",
          }}
          value={memoConfig.memo}
          onChange={(e) => {
            memoConfig.setMemo(e.target.value.substring(0, 256));
            e.preventDefault();
          }}
          autoComplete="off"
          disabled={disabled}
        />
        {errorText != null ? (
          <FormFeedback style={{ display: "block" }}>{errorText}</FormFeedback>
        ) : null}
      </FormGroup>
    );
  }
);
