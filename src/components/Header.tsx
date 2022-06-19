import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import style from '../style/search.module.css'
import { headerProps } from '../interfaces';

const Header: React.FC<headerProps> = (props) => {

  //    ESTADO E HOOK PARA REDIRECIONAR PARA A PÁGINA QUE O USUÁRIO COLOCAR NO INPUT.
  const [param, setParam] = useState<string>('');
  const history = useHistory();

  const refreshData = (): void => {
    if (param) {
      history.push(`/search/${param}`);
      window.location.reload();
    }
  }

  return (
    <>
      <header className={style.detail_header}>
        <img
          className={style.header_icon}
          src={require('../assets/git.png')} alt="GitHub Icon"
          onClick={() => history.push(`/`)}
        />
        {props.barVisibily &&
          <>
            <input className={style.header_input} onChange={(event) => setParam(event.target.value)} />
            <button className={style.header_button} onClick={() => refreshData()} type="button"> Search </button>
          </>
        }
      </header>
    </>
  );
}


export default Header;