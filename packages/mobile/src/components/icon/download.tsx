import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const DownloadIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({ color, size = 24 }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      style={{
        width: size,
        height: size,
      }}
    >
      <Path
        d="M8.75 0.75V9.21875L11.7188 6.25C12 5.9375 12.4688 5.9375 12.7812 6.25C13.0625 6.53125 13.0625 7 12.7812 7.28125L8.5 11.5312C8.21875 11.8438 7.75 11.8438 7.46875 11.5312L3.21875 7.28125C2.90625 7 2.90625 6.53125 3.21875 6.25C3.5 5.9375 3.96875 5.9375 4.28125 6.25L7.25 9.21875V0.75C7.25 0.34375 7.5625 0 8 0C8.40625 0 8.75 0.34375 8.75 0.75ZM4 9.5L5.5 11H2C1.71875 11 1.5 11.25 1.5 11.5V14C1.5 14.2812 1.71875 14.5 2 14.5H14C14.25 14.5 14.5 14.2812 14.5 14V11.5C14.5 11.25 14.25 11 14 11H10.4688L11.9688 9.5H14C15.0938 9.5 16 10.4062 16 11.5V14C16 15.125 15.0938 16 14 16H2C0.875 16 0 15.125 0 14V11.5C0 10.4062 0.875 9.5 2 9.5H4ZM13.5 12.75C13.5 13.1875 13.1562 13.5 12.75 13.5C12.3125 13.5 12 13.1875 12 12.75C12 12.3438 12.3125 12 12.75 12C13.1562 12 13.5 12.3438 13.5 12.75Z"
        fill={color}
      />
    </Svg>
  );
};