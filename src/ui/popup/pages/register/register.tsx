import React, { FunctionComponent, useEffect } from "react";

import { Input } from "../../../components/form";
import { Button } from "../../../components/button";

import useForm from "react-hook-form";

import style from "./style.module.scss";
import classnames from "classnames";

import { FormattedMessage, useIntl } from "react-intl";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");

interface FormData {
  words: string;
  password: string;
  confirmPassword: string;
}

export const RegisterInPage: FunctionComponent<{
  onRegister: (words: string, password: string, recovered: boolean) => void;
  isRecover: boolean;
  isLoading: boolean;
  words: string;
}> = props => {
  const intl = useIntl();

  const { isRecover } = props;
  const { register, handleSubmit, setValue, getValues, errors } = useForm<
    FormData
  >({
    defaultValues: {
      words: "",
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    if (!isRecover) {
      setValue("words", props.words);
    } else {
      setValue("words", "");
    }
  }, [isRecover, setValue]);

  return (
    <div>
      <div className={style.title}>
        {isRecover
          ? intl.formatMessage({
              id: "register.recover.title"
            })
          : intl.formatMessage({
              id: "register.create.title"
            })}
      </div>
      <form
        className={style.formContainer}
        onSubmit={handleSubmit((data: FormData) => {
          props.onRegister(data.words, data.password, isRecover);
        })}
      >
        <div className="field">
          <div className="control">
            <textarea
              className={classnames(
                "textarea",
                "has-fixed-size is-medium",
                style.mnemonic
              )}
              placeholder={intl.formatMessage({
                id: "register.create.textarea.mnemonic.place-holder"
              })}
              readOnly={!isRecover}
              name="words"
              rows={3}
              ref={register({
                required: "Mnemonic is required",
                validate: (value: string): string | undefined => {
                  if (value.split(" ").length < 8) {
                    return intl.formatMessage({
                      id: "register.create.textarea.mnemonic.error.too-short"
                    });
                  }

                  if (!bip39.validateMnemonic(value)) {
                    return intl.formatMessage({
                      id: "register.create.textarea.mnemonic.error.invalid"
                    });
                  }
                }
              })}
            />
          </div>
          {errors.words && errors.words.message ? (
            <p className="help is-danger">{errors.words.message}</p>
          ) : null}
        </div>
        <Input
          label={intl.formatMessage({ id: "register.create.input.password" })}
          type="password"
          name="password"
          ref={register({
            required: intl.formatMessage({
              id: "register.create.input.password.error.required"
            }),
            validate: (password: string): string | undefined => {
              if (password.length < 8) {
                return intl.formatMessage({
                  id: "register.create.input.password.error.too-short"
                });
              }
            }
          })}
          error={errors.password && errors.password.message}
        />
        <Input
          label={intl.formatMessage({
            id: "register.create.input.confirm-password"
          })}
          type="password"
          name="confirmPassword"
          ref={register({
            required: intl.formatMessage({
              id: "register.create.input.confirm-password.error.required"
            }),
            validate: (confirmPassword: string): string | undefined => {
              if (confirmPassword !== getValues()["password"]) {
                return intl.formatMessage({
                  id: "register.create.input.confirm-password.error.unmatched"
                });
              }
            }
          })}
          error={errors.confirmPassword && errors.confirmPassword.message}
        />
        <Button
          color="primary"
          type="submit"
          size="medium"
          loading={props.isLoading}
          fullwidth
        >
          <FormattedMessage id="register.create.button.next" />
        </Button>
      </form>
    </div>
  );
};
