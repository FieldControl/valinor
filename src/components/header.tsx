import CompanyLogo from "@/assets/company/logo.svg";
import Image from "next/image";

export default function Header() {
  return (
    <div className="w-full flex items-center bg-field h-16 px-8 lg:px-16">
      <a href="/" className="cursor-pointer">
        <Image src={CompanyLogo} alt="Field Control" className="w-16 h-16" />
      </a>
    </div>
  );
}
