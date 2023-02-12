import { Footer } from '@app/components/Footer';
import { Header } from '@app/components/Header';
import Head from './head';
import './styles/globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<Head />
			<body className="flex flex-col justify-between h-screen">
				<div>
					<Header />
					{children}
				</div>
				<Footer />
			</body>
		</html>
	);
}
