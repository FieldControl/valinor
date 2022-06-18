import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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
  let { username, reponame } = useParams<string>();
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
  const fileArray = data.filter(data =>data.type === 'file');
  const sortedArr = [...folderArray, ...fileArray]; 
  
  return (
    <>
      {sortedArr.map((data) => (
      <section key={data.name}>
        <img src={sourceImage[data.type]} alt="typeImage" />
        <p>{data.name}</p>        
      </section>
      ))}
    </>
  );
}

export default Detail;
