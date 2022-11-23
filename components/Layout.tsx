import { ReactNode } from "react";
import Footer from "./Footer";
import HeadComponent from "./Head";
import Header from "./Header";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Header />
      <HeadComponent
        title="Marvel | Field Control"
        description="Site desenvolvido com NextJS e consumo de API da Marvel. Este projeto faz parte do desafio de frontend da Field Control."
      />
      <main className="container bg-white p-2 relative h-full m-auto flex flex-col justify-between items-center">{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
