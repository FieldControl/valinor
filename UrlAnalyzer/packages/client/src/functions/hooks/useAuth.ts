import { useState, useEffect } from 'react';

const useAuth = () => {
	const [authenticated, setAuthenticated] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem('url_analyzer_token');

		if (token) {
			setAuthenticated(true);
		}
	}, []);

	const login = (token: string) => {
		localStorage.setItem('url_analyzer_token', token);
		setAuthenticated(true);
	};

	const logout = () => {
		localStorage.removeItem('url_analyzer_token');
		setAuthenticated(false);
	};

	return { authenticated, login, logout };
};

export default useAuth;
