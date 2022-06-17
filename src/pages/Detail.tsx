import React from 'react';
import { useParams } from 'react-router-dom';


const Detail: React.FC = () => {
  let { id } = useParams<string>();
  return (
    <div>
      <h1>{`DETAIL OF ${id}`}</h1>
    </div>
  );
}

export default Detail;
