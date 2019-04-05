import React, { Component } from "react";

import { Container, Form } from "./styles";
import SearchList from "../../components/SearchList";
import api from "../../services/api";

export default class Main extends Component {
  state = {
    searchList: [],
    searchInput: "",
    page: 1
  };

  handlePage = async (e, next) => {
    e.preventDefault();
    let page = 0;
    if (next) {
      page = this.state.page + 1;
    } else {
      page = this.state.page === 1 ? 1 : this.state.page - 1;
    }

    try {
      this.setState(state => ({ page }));
      const response = await api.get(
        `/search/repositories?q=${this.state.searchInput}&page=${page}`
      );
      console.log(`Pagina ${page}`);
      this.setState(state => ({ searchList: response.data.items }));
    } catch (err) {
      console.log("Erro ao retornar os dados.");
    }
  };

  handleClick = async e => {
    e.preventDefault();
    try {
      const response = await api.get(
        `/search/repositories?q=${this.state.searchInput}&page=1`
      );
      console.log(`Pagina ${this.state.page}`);
      this.setState({ searchList: response.data.items });
    } catch (err) {
      console.log("Erro ao retornar os dados.");
    }
  };

  render() {
    return (
      <Container>
        <h2>GITHUB SEARCH</h2>
        <Form onSubmit={e => this.handleClick(e)}>
          <input
            type="text"
            className="input-xsearch"
            value={this.state.searchInput}
            onChange={e => this.setState({ searchInput: e.target.value })}
            placeholder="Faça uma busca aqui"
          />
          <button className="btn-xsearch" type="submit">
            OK
          </button>
        </Form>

        {this.state.searchList.length > 0 ? (
          <table>
            <tbody>
              <tr>
                <td>
                  <button onClick={e => this.handlePage(e, false)}>
                    Anterior
                  </button>
                </td>
                <td>
                  <button onClick={e => this.handlePage(e, true)}>
                    Próximo
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table />
        )}

        <SearchList list={this.state.searchList} />

        {this.state.searchList.length > 0 ? (
          <table>
            <tbody>
              <tr>
                <td>
                  <button onClick={e => this.handlePage(e, false)}>
                    Anterior
                  </button>
                </td>
                <td>
                  <button onClick={e => this.handlePage(e, true)}>
                    Próximo
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <table />
        )}
      </Container>
    );
  }
}
