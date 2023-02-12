import { formatOAuthError } from '@app/utils/formatError';
import { generateRandomHash } from '@app/utils/generateRandom';
import { useState, useEffect } from 'react';
import { FiAlertOctagon } from 'react-icons/fi';

export const useError = (initial: string | null = null) => {
	const [error, setError] = useState<string | null>(initial);

	const errorElementId = `error-prompt-${generateRandomHash()}`;

	useEffect(() => {
		const errorPrompt = document.querySelector<HTMLDivElement>(`#${errorElementId}`);

		if (error && errorPrompt) {
			errorPrompt.classList.remove('transition', 'opacity-0', 'duration-500');
			errorPrompt.classList.add('transition', 'opacity-100', 'duration-100');

			setTimeout(() => {
				errorPrompt.classList.remove('transition', 'opacity-100', 'duration-100');
				errorPrompt.classList.add('transition', 'opacity-0', 'duration-500');
				setTimeout(() => setError(null), 500);
			}, 5_000);
		}
	}, [error, errorElementId]);

	const ErrorElement = () => (
		<div
			className="flex justify-between align-middle text-white text-center font-sans font-bold text-lg bg-[#FF5733] p-3 rounded m-10 fixed opacity-0"
			id={errorElementId}
		>
			<div className="w-[40px]">
				<FiAlertOctagon color="white" size={25} />
			</div>
			<div className="text-white">{formatOAuthError(error!)}</div>
		</div>
	);

	return { error, setError, errorElementId, ErrorElement };
};
