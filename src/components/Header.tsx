import Image from "next/image";
import Link from "next/link";

export default function Header() {
    const icon = 'https://www.shareicon.net/data/2015/09/15/101512_logo_512x512.png';
    
    return (
        <header className="bg-header h-16 w-full flex items-center justify-between ">
            <Link href={'/'} className="ml-8"  >
                <Image alt='icone github'
                    loader={() => icon}
                    color="white"
                    src= {icon}
                    width={40}
                    height={40}
                    className="hover:cursor-pointer" />
            </Link>
        </header>
    )
}