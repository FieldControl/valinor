import React, { useEffect, useState } from 'react';
import style from '../style/detail.module.css'
import '../style/Detail.css';
import Header from '../components/Header';
import { fileDetails, imagePath } from '../interfaces';
import Readme from '../components/Readme';
import { useParams } from 'react-router-dom';

const Detail: React.FC = () => {
  
  //    CONSUMINDO DADOS DA API NA MONTAGEM DO COMPONENTE COM OS PARAMETROS DA URL E ATRIBUINDO A ESTADOS NA APLICAÇÃO.
  let { username, reponame } = useParams<any>();
  const [data, setData] = useState<fileDetails[]>([]);
  
  async function fetchAPI() {
    const response = await fetch(`https://api.github.com/repos/${username}/${reponame}/contents/`);
    const data = await response.json();
    setData(data);
  }
  
  useEffect(() => {
    fetchAPI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //    CAMINHO PARA OS DOIS TIPOS DE ARQUIVO.
  const sourceImage: imagePath = {
    file: require('../assets/file.png'),
    dir: require('../assets/folder.png')
  }

  //    ORGANIZANDO OS ARQUIVOS DO ARRAY PARA TER AS PASTAS PRIMEIROS QUE OS ARQUIVOS.
  const folderArray = data.filter(data => data.type === 'dir');
  const fileArray = data.filter(data => data.type === 'file');
  const sortedArr = [...folderArray, ...fileArray];

  return (
    <>
      <Header barVisibily={true} />

      <section className={style.title_container}>
        <img src={require('../assets/lib.png')} alt="Repo Icon" />
        <h1 className={style.title}>{username + ' / ' + reponame}</h1>
      </section>

      <div className={style.big_dash_wrap}>
        <div className={style.big_dash}></div>
      </div>

      <section className={style.main_div}>
        <div className={style.file_dir}>
          <div className={style.file_first_container}>
            <p > Repository files. </p>
          </div>
          {sortedArr.map((data) => (
            <div className={style.file_container} key={data.name}>
              <img className={`file_icon_${data.type}`} src={sourceImage[data.type]} alt="typeImage" />
              <p>{data.name}</p>
            </div>
          ))}
        </div>
      </section>

      <Readme user={username} repo={reponame}/>
    </>
  );
}

export default Detail;
