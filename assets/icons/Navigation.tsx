import * as React from "react"
import Svg, { Path } from "react-native-svg"
const NavigationIcon = (props:any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={17}
    height={18}
    fill="none"
    {...props}
  >
    <Path
      fill="#FF0935"
      d="M11.12 6.31a.343.343 0 0 1 .44.44l-1.385 3.757a.343.343 0 0 1-.203.203l-3.757 1.384a.343.343 0 0 1-.44-.44L7.16 7.897a.343.343 0 0 1 .203-.203l3.756-1.384Z"
    />
    <Path
      fill="#FF0935"
      fillRule="evenodd"
      d="M8.668 17.422c-6.77 0-8.22-1.45-8.22-8.22 0-6.77 1.45-8.22 8.22-8.22 6.769 0 8.22 1.45 8.22 8.22 0 6.77-1.451 8.22-8.22 8.22Zm2.793-6.442 1.384-3.756c.505-1.371-.828-2.704-2.2-2.2L6.89 6.409c-.47.174-.842.545-1.015 1.015L4.49 11.18c-.505 1.371.828 2.704 2.199 2.2l3.757-1.385c.47-.173.841-.544 1.015-1.015Z"
      clipRule="evenodd"
    />
  </Svg>
)
export default NavigationIcon
