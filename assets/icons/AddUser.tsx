import * as React from "react"
import Svg, { Path } from "react-native-svg"
const AddUserIcon = (props:any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={26}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill="#0166F6"
      d="M5 6a6 6 0 1 0 12 0A6 6 0 0 0 5 6ZM0 19c0 4.117 1.942 5 11 5s11-.883 11-5-1.942-5-11-5c-9.059 0-11 .883-11 5ZM18 10a1 1 0 0 1 1-1h2V7a1 1 0 1 1 2 0v2h2a1 1 0 1 1 0 2h-2v2a1 1 0 1 1-2 0v-2h-2a1 1 0 0 1-1-1Z"
    />
  </Svg>
)
export default AddUserIcon
