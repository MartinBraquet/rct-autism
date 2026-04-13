type FavIconProps = {
  className?: string
}

const FavIconBlack = ({className}: FavIconProps) => (
  <img
    src="https://www.rct-autismmeet.com/favicon-black.svg"
    alt="rct-autism logo"
    className={`w-12 h-12 ${className ?? ''}`}
  />
)

export default FavIconBlack
