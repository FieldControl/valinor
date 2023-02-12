export function LoadingSpin() {
	return (
		<div
			className="relative flex items-center justify-center flex-col p-2"
			style={{
				color: 'rgb(55 65 81)',
				fill: 'rgb(55 65 81)',
				stroke: 'rgb(55 65 81)',
			}}
		>
			<svg
				className="animate-spin h-24 w-24"
				style={{
					strokeLinecap: 'round',
				}}
				viewBox="0 0 120 120"
			>
				<circle className="opacity-10" cx="60" cy="60" r="30px" strokeWidth="8" />
				<circle
					className="fill-none"
					cx="60"
					cy="60"
					r="30px"
					strokeWidth="8"
					style={{
						strokeDasharray: `60, 360`,
					}}
				/>
			</svg>
		</div>
	);
}
