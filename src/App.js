import React from 'react';
import './App.css';

function App() {
  const [inputValue, setInputValue] = React.useState("");
  const [isCarregando, setCarregando] = React.useState(false);
  const [erro, setErro] = React.useState(false);
  const [repos, setRepos] = React.useState([]);

  React.useEffect(() => {
    if(!inputValue) {
      return;
    }

    setCarregando(true);

    fetch("https://api.github.com/search/repositories?q=" + inputValue)
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log(data);
      setCarregando(false);
      setRepos(data.items);
    }).catch(err => {
      setCarregando(false);
      setErro(true);
      console.error(err);
    })
  }, [inputValue]);

  return (
    <div>
      <form onSubmit={evt => {
        evt.preventDefault();
        setInputValue(evt.target.elements.busca.value);
      }}>
      <input 
      type="text" 
      name="busca" 
      className="busca_repositorio_input"
      placeholder="Procure repositórios no Github" />
      </form>
      {isCarregando && <div>Carregando...</div>}
      {erro && (
      <div>
        Erro inesperado ao buscar dados. Tente de novo mais tarde!
      </div>
      )}
      <ul className="repo_lista">
        {repos.map(repo => {
        return (
          <li key={repo.id} className="repo_item">
          <a href={repo.html_url} target="_blank"> 
          {repo.name}
          </a>
          <p>{repo.description}</p>
          </li>
        );  
      })}</ul>
    </div>
  );
}

export default App;
