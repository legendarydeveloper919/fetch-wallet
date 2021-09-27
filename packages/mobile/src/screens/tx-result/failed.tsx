import React, { FunctionComponent, useEffect } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PageWithView } from "../../components/page";
import { Text, View, Animated, Dimensions } from "react-native";
import { Button } from "../../components/button";
import { useStyle } from "../../styles";
import { useSmartNavigation } from "../../navigation";
import { RightArrowIcon } from "../../components/icon";
import LottieView from "lottie-react-native";
import * as WebBrowser from "expo-web-browser";

export const TxFailedResultScreen: FunctionComponent = observer(() => {
  const { chainStore } = useStore();
  const [failedAnimProgress] = React.useState(new Animated.Value(0));

  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          chainId?: string;
          // Hex encoded bytes.
          txHash: string;
        }
      >,
      string
    >
  >();

  const chainId = route.params.chainId
    ? route.params.chainId
    : chainStore.current.chainId;
  const txHash = route.params.txHash;

  const style = useStyle();
  const smartNavigation = useSmartNavigation();

  const chainInfo = chainStore.getChain(chainId);

  useEffect(() => {
    const animateLottie = () => {
      Animated.timing(failedAnimProgress, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
    };

    const timeoutId = setTimeout(animateLottie, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageWithView
      disableSafeArea
      style={style.flatten([
        "flex-grow-1",
        Dimensions.get("window").width > 375 ? "padding-x-42" : "padding-x-20",
        "items-center",
        "background-color-white",
      ])}
    >
      <View style={style.flatten(["flex-3"])} />
      <View style={style.flatten(["width-122", "height-122"])}>
        <View
          style={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            ...style.flatten(["absolute", "justify-center", "items-center"]),
          }}
        >
          <LottieView
            source={require("../../assets/lottie/failed.json")}
            progress={failedAnimProgress}
            style={style.flatten(["width-160"])}
          />
        </View>
      </View>
      <Text style={style.flatten(["h2", "margin-top-82", "margin-bottom-32"])}>
        Transaction failed
      </Text>

      <View style={style.flatten(["min-height-66"])}>
        <Text
          style={style.flatten([
            "body1",
            "text-center",
            "color-text-black-low",
          ])}
        >
          Transaction unsuccessful.
        </Text>
        <Text
          style={style.flatten([
            "body1",
            "text-center",
            "color-text-black-low",
          ])}
        >
          Please check the block explorer for more information.
        </Text>
      </View>

      <View style={style.flatten(["height-116", "margin-top-58"])}>
        <View style={style.flatten(["flex-row", "width-full"])}>
          <Button
            containerStyle={style.flatten(["flex-1"])}
            size="large"
            text="Confirm"
            onPress={() => {
              smartNavigation.navigateSmart("Home", {});
            }}
          />
        </View>
        {chainInfo.raw.txExplorer ? (
          <Button
            containerStyle={style.flatten(["margin-top-16"])}
            size="default"
            text={`View on ${chainInfo.raw.txExplorer.name}`}
            mode="text"
            rightIcon={
              <View style={style.flatten(["margin-left-8"])}>
                <RightArrowIcon
                  color={style.get("color-primary").color}
                  height={12}
                />
              </View>
            }
            onPress={() => {
              if (chainInfo.raw.txExplorer) {
                WebBrowser.openBrowserAsync(
                  chainInfo.raw.txExplorer.txUrl.replace(
                    "{txHash}",
                    txHash.toUpperCase()
                  )
                );
              }
            }}
          />
        ) : null}
      </View>
      <View style={style.flatten(["flex-2"])} />
    </PageWithView>
  );
});
