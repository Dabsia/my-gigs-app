import * as React from "react"
import Svg, { Path } from "react-native-svg"
const DevIcon = (props:any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={17}
    fill="none"
    {...props}
  >
    <Path
      fill="#EE9F35"
      fillRule="evenodd"
      d="M9.07 16.976c-6.769 0-8.22-1.45-8.22-8.22 0-6.77 1.451-8.22 8.22-8.22 6.77 0 8.221 1.45 8.221 8.22 0 6.77-1.45 8.22-8.22 8.22Zm-.815-3.952a.685.685 0 0 1-.542-.803L9.078 5.2a.685.685 0 1 1 1.345.261l-1.365 7.02a.685.685 0 0 1-.803.543ZM6.815 7.87a.685.685 0 0 0-.969-.969l-1.37 1.37a.685.685 0 0 0 0 .97l1.37 1.37a.685.685 0 0 0 .969-.97l-.886-.885.886-.886Zm4.511 0a.685.685 0 0 1 .97-.969l1.37 1.37a.685.685 0 0 1 0 .97l-1.37 1.37a.685.685 0 0 1-.97-.97l.886-.885-.886-.886Z"
      clipRule="evenodd"
    />
  </Svg>
)
export default DevIcon
