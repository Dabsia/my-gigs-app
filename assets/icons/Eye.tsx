import * as React from "react"
import Svg, { Path } from "react-native-svg"
const EyeIcon = (props:any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={11}
    fill="none"
    {...props}
  >
    <Path
      stroke="#212135"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.565}
      d="M6 5.478c1.75 1.826 4.25 1.826 6 0"
    />
    <Path
      stroke="#212135"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.565}
      d="M1.257 5.818c.62.736 1.666 1.837 3.015 2.75C5.623 9.48 7.234 10.173 9 10.173c1.767 0 3.377-.694 4.727-1.607 1.35-.912 2.396-2.013 3.017-2.749a.516.516 0 0 0 0-.68c-.62-.736-1.667-1.837-3.017-2.749C12.377 1.476 10.767.783 9 .783c-1.766 0-3.377.693-4.728 1.606-1.35.912-2.395 2.013-3.015 2.75a.515.515 0 0 0 0 .68Z"
    />
  </Svg>
)
export default EyeIcon
