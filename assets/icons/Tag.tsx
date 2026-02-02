import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
const TagIcon = (props:any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={72}
    height={72}
    fill="none"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill="#05A76B"
        d="m32.7 6.3 29.697 4.245 4.242 29.7-27.576 27.576a3 3 0 0 1-4.242 0l-29.7-29.7a3 3 0 0 1 0-4.242L32.7 6.3Zm8.484 25.458a6 6 0 1 0 8.484-8.486 6 6 0 0 0-8.484 8.486Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h72v72H0z" />
      </ClipPath>
    </Defs>
  </Svg>
)
export default TagIcon
