import Head from "next/head";
import { ReactNode } from "react";

type HeadProps = {
  title?: string;
  keywords?: string;
  description?: string;
  children?: ReactNode;
};

const HeadComponent = ({
  title,
  keywords,
  description,
  children,
}: HeadProps) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="X-UA-Compatible" content="IE=7" />
      <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
      <meta name="keywords" content={keywords} />
      <meta httpEquiv="Content-Type" content="text/html;charset=UTF-8" />
      <meta name="description" content={description} />
      {children}
    </Head>
  );
};

export default HeadComponent;
