'use client';

import useAuth from '@app/functions/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { MdLogin, MdLogout } from 'react-icons/md';
import UrlAnalyzerSvg from '../../public/favicon.ico';

export function Header({ hideLogin = false as boolean }): JSX.Element {
	const auth = useAuth();

	const handleLogout = () => {
		auth.logout();
	};

	return (
		<header className="text-white flex justify-between items-center p-4 bg-slate-800">
			<div className="flex gap-3">
				<Image alt="Url Analyzer" height={32} src={UrlAnalyzerSvg} width={32} />
				<div className="border border-gray-500" />
				<Link className="text-3xl font-sans font-extrabold" href="/">
					Url Analyzer
				</Link>
			</div>
			<nav className="flex space-x-4">
				<div className="text-white text-lg ali">
					{hideLogin ? (
						<div />
					) : auth.authenticated ? (
						<button
							className="flex justify-between gap-3 bg-slate-700 p-2 rounded"
							onClick={handleLogout}
							type="button"
						>
							<MdLogout size={25} />
							<span>Logout</span>
						</button>
					) : (
						<Link className="flex justify-between gap-3 bg-slate-700 p-2 rounded" href="/login">
							<MdLogin size={25} />
							<div>Login</div>
						</Link>
					)}
				</div>
			</nav>
		</header>
	);
}

Header.propTypes = {
	hideLogin: PropTypes.bool,
};
