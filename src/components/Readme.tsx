import React, { useEffect, useState } from 'react';
import style from '../style/readme.module.css'
import { readmeProps } from '../interfaces';
import { marked } from 'marked';

const Readme: React.FC<readmeProps> = (props) => {

  //    ESTADO PARA ARMAZENAR O README.
  const [readme, setReadme] = useState<string>('');

  //    FUNÇÃO QUE CHECA SE A BRANCH PRINCIPAL É A MAIN OU A MASTER E ALOCA O VALOR DA CORRETA NO ESTADO;
  async function fetchAPI() {
    const mark = await fetch(`https://raw.githubusercontent.com/${props.user}/${props.repo}/master/README.md`);
    const down = await mark.text();
    const html = marked(down);

    const mark_main = await fetch(`https://raw.githubusercontent.com/${props.user}/${props.repo}/main/README.md`);
    const down_master = await mark_main.text();
    const html_master = marked(down_master);
    if(html.includes('404')) setReadme(html_master);
    else setReadme(html);    
  }

  useEffect(() => {
    fetchAPI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <section className={style.read_container}>
        <div className={style.read_title_wrap}><h1 className={style.read_title}>Readme</h1></div>
        <article dangerouslySetInnerHTML={{ __html: readme }}>
        </article>
      </section>
    </>
  );
}


export default Readme;