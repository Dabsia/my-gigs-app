import * as React from "react";
import Svg, { Path } from "react-native-svg";
const UserIcon = (props: any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color}
      // fill="#0166F6"
      d="M0 19c0 4.117 1.942 5 11 5s11-.883 11-5-1.942-5-11-5c-9.059 0-11 .883-11 5ZM5 6a6 6 0 1 0 12 0A6 6 0 0 0 5 6Z"
    />
  </Svg>
);
export default UserIcon;
