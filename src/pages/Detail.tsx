import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import style from '../style/detail.module.css'
import '../style/Detail.css'

interface Data {
  name: string,
  type: string,
}

interface imageIcon {
  [key: string]: string,
}

const sourceImage: imageIcon = {
  file: 'https://i.ibb.co/Z8XxszW/arquivo.png',
  dir: 'https://i.ibb.co/1T07b8M/pasta.png'
}

const Detail: React.FC = () => {
  const navigate = useNavigate();
  let { username, reponame } = useParams<string>();
  const [param, setParam] = useState<string>('');
  const [data, setData] = useState<Data[]>([]);

  async function fetchAPI() {
    const response = await fetch(`https://api.github.com/repos/${username}/${reponame}/contents/`);
    const data = await response.json();
    setData(data);
  }
  useEffect(() => {
    fetchAPI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const folderArray = data.filter(data => data.type === 'dir');
  const fileArray = data.filter(data => data.type === 'file');
  const sortedArr = [...folderArray, ...fileArray];

  return (
    <>
      <header className={style.detail_header}>
        <img
          className={style.header_icon}
          src="https://cdn.icon-icons.com/icons2/2429/PNG/512/github_logo_icon_147285.png" alt="GitHub Icon"
          onClick={() => navigate(`/`)}
        />
        <input className={style.header_input} onChange={(event) => setParam(event.target.value)} />
        <button className={style.header_button} onClick={() => navigate(`/search/${param}`)} type="button"> Search </button>
      </header>
      <section className={style.title_container}>
        <img src="https://i.ibb.co/dQ7tgZb/repo.png" alt="Repo Icon" />
        <h1 className={style.title}>{username + ' / ' + reponame}</h1>
      </section>
      <main className={style.main_div}>

        <section className={style.file_dir}>
          <div className={style.file_first_container}>
            <p > Repository files. </p>
          </div>
          {sortedArr.map((data) => (
            <div className={style.file_container} key={data.name}>
              <img className={`file_icon_${data.type}`} src={sourceImage[data.type]} alt="typeImage" />
              <p>{data.name}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}

export default Detail;
