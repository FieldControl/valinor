import { ReactNode } from "react";
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
      <main className="container flex gap-4 m-auto justify-between">
        {children}
      </main>
    </>
  );
};

export default Layout;
