'use client';

import useAuth from '@app/functions/hooks/useAuth';
import { useError } from '@app/functions/hooks/useError';
import type {
	GETOAuth2AuthorizeEndpointReturn,
	POSTAuthLoginEndpointBody,
	POSTAuthLoginEndpointReturn,
} from '@app/types';
import { makeApiRequest } from '@app/utils/makeApiReq';
import { addTemporaryClass } from '@app/utils/tempClass';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, redirect } from 'next/navigation';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { SiDiscord } from 'react-icons/si';
import MicrosoftSvg from '../../../public/Microsoft.svg';
import { validateEmail } from '../../utils/validators';

const handleNormalLogin = async (setters: {
	auth: ReturnType<typeof useAuth>;
	setError: Dispatch<SetStateAction<string | null>>;
}) => {
	const email = document.querySelector<HTMLInputElement>('#email-input');
	const password = document.querySelector<HTMLInputElement>('#password-input');

	if (!email || !password) {
		return;
	}

	const emailValue = email.value;

	if (!emailValue || !validateEmail(emailValue)) {
		addTemporaryClass(email, ['border', 'border-red-500'], 2_000);
		setters.setError('Please enter a valid email.');
		return;
	}

	const passwordValue = password.value;

	if (!passwordValue) {
		addTemporaryClass(password, ['border', 'border-red-500'], 2_000);
		setters.setError('Please enter a password.');
		return;
	}

	const body: POSTAuthLoginEndpointBody = {
		email: emailValue,
		password: passwordValue,
	};

	const loginButton = document.querySelector<HTMLButtonElement>('#login-button')!;

	loginButton.setAttribute('disabled', 'true');
	loginButton.textContent = 'Logging in...';

	const session = await makeApiRequest<POSTAuthLoginEndpointReturn>('/oauth2/login', {
		method: 'POST',
		body: JSON.stringify(body),
	});

	if (session.error) {
		setters.setError(`${session.error.description} (${session.error.message})`);
		loginButton.removeAttribute('disabled');
		loginButton.textContent = 'Login';
		return;
	}

	if (!session.data) {
		setters.setError('An unknown error occurred.');
		loginButton.removeAttribute('disabled');
		loginButton.textContent = 'Login';
		return;
	}

	setters.auth.login(session.data.token);
	redirect('/');
};

export default function LoginPage() {
	const auth = useAuth();
	if (auth.authenticated) {
		redirect('/');
	}

	const searchParams = useSearchParams();

	const sessionToken = searchParams.get('session');
	const { setError, ErrorElement } = useError(searchParams.get('error'));

	if (sessionToken) {
		auth.login(sessionToken);
		redirect('/');
	}

	// eslint-disable-next-line react/hook-use-state
	const [OAuthUrls, setOAuthUrls] = useState<GETOAuth2AuthorizeEndpointReturn['data'] | null>(null);

	useEffect(() => {
		const fetchUrls = async () => {
			const urls = await makeApiRequest<GETOAuth2AuthorizeEndpointReturn>('/oauth2/urls');
			setOAuthUrls(urls.data);
		};

		void fetchUrls();
	}, []);

	return (
		<>
			<ErrorElement />
			<main className="flex flex-col gap-4 items-center pt-[3rem]">
				<div className="text-7xl font-bold text-center font-sans text-white pb-[7rem]">Login</div>
				<div className="flex justify-between gap-20">
					<div className="flex flex-col items-center justify-center">
						<div className="flex flex-col justify-center bg-white rounded w-[300px]">
							<div className="text-center m-5">
								<span className="text-black font-sans font-bold text-xl">Email:</span>
								<input className="px-2 bg-gray-300 focus:outline-none w-64 h-8 rounded" id="email-input" type="email" />
							</div>
							<div className="text-center m-5">
								<span className="text-black font-sans font-bold text-xl">Password:</span>
								<input
									className="px-2 bg-gray-300 focus:outline-none w-64 h-8 rounded"
									id="password-input"
									type="password"
								/>
							</div>
							<div className="text-center m-3 px-5 pt-3">
								<button
									className="text-gray-200 text-lg bg-slate-600 rounded py-2 w-full"
									id="login-button"
									onClick={async () =>
										handleNormalLogin({
											auth,
											setError,
										})
									}
									type="button"
								>
									Login
								</button>
							</div>
						</div>
					</div>
					<div className="border border-gray-500" />
					<div className="flex flex-col gap-4 items-center justify-center">
						<Link
							className="flex rounded text-center bg-slate-100 w-[300px] px-5 py-3"
							href={OAuthUrls ? OAuthUrls.google : ''}
						>
							<div className="w-[40px] border-r border-gray-500 mr-3">
								<FcGoogle size={28} />
							</div>
							<div className={OAuthUrls ? ' text-black' : 'text-gray-400 pointer-events-none'}>
								Continue with Google
							</div>
						</Link>
						<Link className="flex rounded bg-slate-100 w-[300px] px-5 py-3" href={OAuthUrls ? OAuthUrls.microsoft : ''}>
							<div className="w-[40px] border-r border-gray-500 mr-3">
								<Image alt="Microsoft svg" src={MicrosoftSvg} width={28} />
							</div>
							<div className={OAuthUrls ? ' text-black' : 'text-gray-400 pointer-events-none'}>
								Continue with Microsoft
							</div>
						</Link>
						<Link
							className="flex rounded text-center bg-slate-100 w-[300px] px-5 py-3"
							href={OAuthUrls ? OAuthUrls.github : ''}
						>
							<div className="w-[40px] border-r border-gray-500 mr-3">
								<FaGithub size={28} />
							</div>
							<div className={OAuthUrls ? 'text-black' : 'text-gray-400 pointer-events-none'}>Continue with GitHub</div>
						</Link>
						<Link
							className="flex rounded text-center bg-slate-100 w-[300px] px-5 py-3"
							href={OAuthUrls ? OAuthUrls.discord : ''}
						>
							<div className="w-[40px] border-r border-gray-500 mr-3">
								<SiDiscord size={28} />
							</div>
							<div className={OAuthUrls ? 'text-black' : 'text-gray-400 pointer-events-none'}>
								Continue with Discord
							</div>
						</Link>
					</div>
				</div>
			</main>
		</>
	);
}
