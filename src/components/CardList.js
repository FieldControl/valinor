import Card from "./Card";
import { request } from "../request";
import { useEffect, useState } from "react";
import { Container } from "./styles/Container.styled";

import React from "react";
import { InputContext } from "./Context";


export function Cardlist (){
  const { input } = React.useContext(InputContext)
  console.log(input)
  const [res, setRes] = useState([]);
  
  useEffect(() => {
    async function githubResponse() {
      const res = await request(input);
      setRes(res);
    }

    githubResponse();
  }, [input])

  return (
    <Container>
        {res.map((item, index) => (
          <Card key={index} item={item} />
        ))}
    </Container>
  );
}