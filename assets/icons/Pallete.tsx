import * as React from "react"
import Svg, { Path } from "react-native-svg"
const PaalleteIcon = (props:any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={18}
    fill="none"
    {...props}
  >
    <Path
      fill="#5A45FF"
      fillRule="evenodd"
      d="M9.07 17.347c-5.822 0-8.22-2.398-8.22-8.22C.85 3.303 3.248.905 9.07.905c5.823 0 8.221 2.398 8.221 8.22 0 .625-.736 1.004-1.344.86-.502-.118-1.08-.175-1.738-.175-3.154 0-4.453 1.3-4.453 4.453 0 .659.056 1.237.175 1.739.143.608-.235 1.344-.86 1.344Zm3.426-11.303a1.028 1.028 0 1 1-2.055 0 1.028 1.028 0 0 1 2.055 0ZM8.043 5.7a1.028 1.028 0 1 0 0-2.055 1.028 1.028 0 0 0 0 2.055ZM6.331 7.414a1.028 1.028 0 1 1-2.055 0 1.028 1.028 0 0 1 2.055 0Zm-.343 4.453a1.028 1.028 0 1 0 0-2.056 1.028 1.028 0 0 0 0 2.056Z"
      clipRule="evenodd"
    />
  </Svg>
)
export default PaalleteIcon
