import * as React from "react"
import Svg, { Path } from "react-native-svg"
const MoreIcon = (props:any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <Path
      fill={props.color}
      d="M0 5.5C0 10.03.97 11 5.5 11s5.5-.97 5.5-5.5S10.03 0 5.5 0 0 .97 0 5.5ZM0 18.5C0 23.03.97 24 5.5 24s5.5-.97 5.5-5.5-.97-5.5-5.5-5.5-5.5.97-5.5 5.5ZM13 5.5c0 4.53.97 5.5 5.5 5.5s5.5-.97 5.5-5.5S23.03 0 18.5 0 13 .97 13 5.5ZM13 18.5c0 4.53.97 5.5 5.5 5.5s5.5-.97 5.5-5.5-.97-5.5-5.5-5.5-5.5.97-5.5 5.5Z"
    />
  </Svg>
)
export default MoreIcon
