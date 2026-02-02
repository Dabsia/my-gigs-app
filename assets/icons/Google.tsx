import * as React from "react"
import Svg, { Rect, Path } from "react-native-svg"
const GoogleIcon = (props: any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={28}
    height={28}
    fill="none"
    {...props}
  >
    <Rect width={28} height={28} fill="#F8F5F5" rx={14} />
    <Path
      fill="#4285F4"
      fillRule="evenodd"
      d="M22.638 14.207c0-.646-.058-1.266-.166-1.862h-8.57v3.52h4.897a4.186 4.186 0 0 1-1.815 2.747v2.283h2.94c1.721-1.584 2.714-3.917 2.714-6.688Z"
      clipRule="evenodd"
    />
    <Path
      fill="#34A853"
      fillRule="evenodd"
      d="M13.902 23.1c2.457 0 4.517-.815 6.022-2.205l-2.94-2.283c-.815.546-1.858.869-3.082.869-2.37 0-4.376-1.601-5.092-3.752H5.77v2.358a9.096 9.096 0 0 0 8.132 5.013Z"
      clipRule="evenodd"
    />
    <Path
      fill="#FBBC05"
      fillRule="evenodd"
      d="M8.81 15.73A5.47 5.47 0 0 1 8.525 14c0-.6.103-1.183.285-1.729V9.913H5.77A9.096 9.096 0 0 0 4.802 14c0 1.469.352 2.858.968 4.087l3.04-2.358Z"
      clipRule="evenodd"
    />
    <Path
      fill="#EA4335"
      fillRule="evenodd"
      d="M13.902 8.52c1.336 0 2.536.459 3.479 1.36l2.61-2.61c-1.576-1.468-3.636-2.37-6.089-2.37A9.097 9.097 0 0 0 5.77 9.913l3.04 2.358c.716-2.15 2.722-3.752 5.092-3.752Z"
      clipRule="evenodd"
    />
  </Svg>
)
export default GoogleIcon
