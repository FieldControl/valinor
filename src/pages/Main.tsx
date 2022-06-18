import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Main: React.FC = () => {
  const [param, setParam] = useState<string>('');
  const navigate = useNavigate();

  return (
    <>
      <input onChange={(event) => setParam(event.target.value)} />
      <button onClick={() => navigate(`/search/${param}`)} type="button">Search</button>
    </>
  );
}

export default Main;
