import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Data {
  id: number,
  name: string,
  full_name: string,
  description: string,
  topics: string[],
  updated_at: string,
  language: string,
}

const SearchCard: React.FC<Data> = (props) => {
  const navigate = useNavigate();
  const currentDate = props.updated_at.replace(/[A-Za-z]/g, " ").split(' ');

  return (
    <>
      <div className='upperBar'></div>
      <section className={props.full_name} onClick={() => navigate(`/details/${props.full_name}`)}>
        <h1 key={props.id}>{props.full_name}</h1>
        <h2>{props.description}</h2>
        {props.topics.map((top) => (<p>{top}</p>))}
        <h4>{props.language}</h4>
        <h4>{`Last update: ${currentDate[0]} at ${currentDate[1]}`}</h4>
      </section>
    </>
  );
}

export default SearchCard;