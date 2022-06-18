import React from 'react';
import { useNavigate } from 'react-router-dom';
import style from '../style/search_card.module.css'
import { cardProps } from '../interfaces';

const SearchCard: React.FC<cardProps> = (props) => {
  
  //    CARD COM TODAS AS INFORMAÇÕES RECEBIDAS POR PROPS.
  const navigate = useNavigate();
  const currentDate = props.data.updated_at.replace(/[A-Za-z]/g, " ").split(' ');

  return (
    <section className={style.card_container}>
      <div className={style.upper_bar}></div>
      <div className={style.card_container} >
        <div className={style.card_header}>
          <img src="https://i.ibb.co/dQ7tgZb/repo.png" alt="Repo Icon" />
          <h1 className={style.card_title} onClick={() => navigate(`/details/${props.data.full_name}`)} key={props.data.id}>{props.data.full_name}</h1></div>
        <div className={style.card_body}>
          <p className={style.card_desc}>{props.data.description}</p>
          <ul className={style.card_list}>
            {// eslint-disable-next-line jsx-a11y/anchor-is-valid
              props.data.topics.map(topic => <a className={style.card_topics}>{topic}</a>)}
          </ul>
        </div>
        <div className={style.card_footer}>
          <p>{`${props.data.language}`}</p>
          <p>{`Last updated on ${currentDate[0]} at ${currentDate[1]}`}</p>
        </div>
      </div>
    </section>
  );
}

export default SearchCard;