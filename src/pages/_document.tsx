import { Html, Head, Main, NextScript } from 'next/document';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function Document() {
    return(
        <Html className="bg-background min-h-screen flex flex-col gap-14">
            <Head>  
                <link rel="shortcut icon" href="/githubicon.png" type="image/x-icon" />
            </Head>
            <Header />
            <Main />
            <NextScript />
            <Footer  />
        </Html>
    )
}1