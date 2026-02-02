import * as React from "react"
import Svg, { Path } from "react-native-svg"
const NotificationIcon = (props:any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={22}
    fill="none"
    {...props}
  >
    <Path
      stroke="#101010"
      strokeLinecap="round"
      strokeMiterlimit={10}
      strokeWidth={1.313}
      d="M11.018 3.046a5.254 5.254 0 0 0-5.25 5.25v2.529c0 .534-.228 1.347-.5 1.802L4.264 14.3c-.622 1.032-.193 2.178.944 2.563a18.306 18.306 0 0 0 11.612 0 1.752 1.752 0 0 0 .945-2.563l-1.006-1.672c-.263-.455-.49-1.268-.49-1.802V8.296c0-2.887-2.363-5.25-5.25-5.25Z"
    />
    <Path
      stroke="#101010"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.313}
      d="M12.636 3.3a5.91 5.91 0 0 0-3.237 0 1.737 1.737 0 0 1 1.619-1.102c.734 0 1.364.455 1.618 1.102Z"
    />
    <Path
      stroke="#101010"
      strokeMiterlimit={10}
      strokeWidth={1.313}
      d="M13.643 17.177a2.633 2.633 0 0 1-2.626 2.625 2.634 2.634 0 0 1-1.854-.77 2.634 2.634 0 0 1-.77-1.855"
    />
  </Svg>
)
export default NotificationIcon
