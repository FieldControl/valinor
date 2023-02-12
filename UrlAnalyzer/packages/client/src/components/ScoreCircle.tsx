import { useMemo } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';

export function ScoreCircle({ score }: { score: number | null }) {
	const scoreColor = useMemo(() => {
		if (score === null) return 'gray';
		if (score < 0.5) return 'red';
		if (score < 0.75) return 'orange';
		return 'green';
	}, [score]);

	const circlePercentage = useMemo(() => {
		if (score === null) return 0;
		return score * 360;
	}, [score]);

	return (
		<div
			className="relative flex items-center flex-col p-2"
			style={{
				color: scoreColor,
				fill: scoreColor,
				stroke: scoreColor,
			}}
		>
			<div className="relative h-24">
				<svg
					className="h-24 w-24"
					style={{
						strokeLinecap: 'round',
					}}
					viewBox="0 0 120 120"
				>
					<circle className="opacity-10" cx="60" cy="60" r="56px" strokeWidth="8" />
					<circle
						className="fill-none load"
						cx="60"
						cy="60"
						r="56px"
						strokeWidth="8"
						style={{
							transform: 'rotate(-87.9537deg)',
							strokeDasharray: `${circlePercentage - 10}, 352`,
							transformOrigin: '50% 50%',
						}}
					/>
				</svg>
			</div>
			<div
				className="absolute items-center font-bold text-white"
				style={{
					fontSize: `30px`,
					top: score ? `31%` : '27%',
				}}
			>
				{score === null ? <RiErrorWarningLine size={34} /> : Math.round(score * 100)}
			</div>
		</div>
	);
}

export function SmallScoreCircle({ score }: { score: number | null }) {
	const scoreColor = useMemo(() => {
		if (score === null) return 'gray';
		if (score < 0.5) return 'red';
		if (score < 0.75) return 'orange';
		return 'green';
	}, [score]);

	const circlePercentage = useMemo(() => {
		if (score === null) return 0;
		return score * 360;
	}, [score]);

	return (
		<div
			className="relative flex items-center justify-center flex-col p-2"
			style={{
				color: scoreColor,
				fill: scoreColor,
				stroke: scoreColor,
			}}
		>
			<div className="relative h-24">
				<svg
					className="h-24 w-24"
					style={{
						strokeLinecap: 'round',
					}}
					viewBox="0 0 120 120"
				>
					<circle className="opacity-10" cx="60" cy="60" r="30px" strokeWidth="8" />
					<circle
						className="fill-none load"
						cx="60"
						cy="60"
						r="30px"
						strokeWidth="8"
						style={{
							transform: 'rotate(-87.9537deg)',
							strokeDasharray: `${(circlePercentage + (score === 1 ? 10 : 0)) / 2}, 360`,
							transformOrigin: '50% 50%',
						}}
					/>
				</svg>
			</div>
			<div
				className="absolute items-center font-bold text-white"
				style={{
					fontSize: `20px`,
					top: score ? `37%` : '40%',
				}}
			>
				{score === null ? <RiErrorWarningLine size={24} /> : Math.round(score * 100)}
			</div>
		</div>
	);
}
