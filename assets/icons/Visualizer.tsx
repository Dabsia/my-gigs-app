import * as React from "react"
import Svg, { Path } from "react-native-svg"
const VisualizerIcon = (props:any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={17}
    height={17}
    fill="none"
    {...props}
  >
    <Path
      fill="#0166F6"
      d="M4.795 10.96a.685.685 0 1 0 1.37 0 .685.685 0 0 0-1.37 0ZM10.96 4.795a.685.685 0 1 0 0 1.37.685.685 0 0 0 0-1.37Z"
    />
    <Path
      fill="#0166F6"
      fillRule="evenodd"
      d="M8.22 16.44C1.45 16.44 0 14.99 0 8.22 0 1.45 1.45 0 8.22 0c6.77 0 8.22 1.45 8.22 8.22 0 6.77-1.45 8.22-8.22 8.22ZM5.48 3.425a.685.685 0 0 0-.685.685v4.912a2.056 2.056 0 1 0 1.37 0V4.11a.685.685 0 0 0-.685-.685Zm5.48 9.59a.685.685 0 0 1-.685-.685V7.418a2.056 2.056 0 1 1 1.37 0v4.912a.685.685 0 0 1-.685.685Z"
      clipRule="evenodd"
    />
  </Svg>
)
export default VisualizerIcon
