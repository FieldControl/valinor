interface SvgProps{
  height:number
  widht:number
}
export function RightSvg({height,widht}:SvgProps){
  return (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width={widht}
    height={height}
    viewBox="0 0 256 256"
  >
    <path fill="none" d="M0 0H256V256H0z" />
    <path
      fill="none"
      stroke="#539bf5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={16}
      d="M96 48L176 128 96 208"
    />
  </svg>
  );
}