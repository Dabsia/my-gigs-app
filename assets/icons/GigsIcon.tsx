import * as React from "react"
import Svg, { Path } from "react-native-svg"
const GigsIcon = (props:any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path fill={props.color} d="M12 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
    <Path
      fill={props.color}
      fillRule="evenodd"
      d="M12 24C2.118 24 0 21.882 0 12S2.118 0 12 0s12 2.118 12 12-2.118 12-12 12ZM9 6a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1Zm3 14a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
      clipRule="evenodd"
    />
  </Svg>
)
export default GigsIcon
