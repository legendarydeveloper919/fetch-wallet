import React, { FunctionComponent } from "react";
import Svg, { Path } from "react-native-svg";

export const RightArrowIcon: FunctionComponent<{
  color: string;
  height: number;
}> = ({ color, height }) => {
  return (
    <Svg
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
      clipRule="evenodd"
      viewBox="0 0 8 14"
      style={{
        height,
        aspectRatio: 8 / 14,
      }}
    >
      <Path
        fill="none"
        fillRule="nonzero"
        stroke={color}
        strokeWidth="2"
        d="M1.188 1.375L6.813 7l-5.625 5.625"
        transform="translate(-.139 -.243) scale(1.03469)"
      />
    </Svg>
  );
};
