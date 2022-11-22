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
      <main className="container relative h-full m-auto justify-between">{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
