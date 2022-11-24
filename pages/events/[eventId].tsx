import { GetServerSideProps } from "next";
import { useApiSearchById } from "../../libs/useApiSearchById";

import { useState } from "react";
import { ItemProps } from "../../interfaces/ItemProps";
import Article from "../../components/Article";
import Profile from "../../components/Profile";

const Event = ({ data }: ItemProps) => {
  return (
    <Profile type="events" data={data}>
      <Article type="More" data={0} path="videos" />
    </Profile>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { eventId } = context.query;
  const privatekey = process.env.API_PRIVATE_KEY;
  const apiById = useApiSearchById(privatekey as string, "events", Number(eventId));
  const event = await apiById.getData();

  return {
    props: {
      data: event.results,
    },
  };
};

export default Event;
