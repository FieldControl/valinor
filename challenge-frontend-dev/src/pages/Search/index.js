import React from 'react';

import SearchList from '../../components/SearchList';

import {
  Container,
  Aside,
  Itens,
  Languages,
  Repositories,
  FooterAside,
} from './styles';

export default function Search() {
  return (
    <Container>
      <Aside>
        <Itens>
          <ul>
            <a href="/">
              <li>
                Repositories<span>1M</span>
              </li>
            </a>
            <hr />
            <a href="/">
              <li>
                Code<span>54M+</span>
              </li>
            </a>
            <hr />
            <a href="/">
              <li>
                Commits<span>5M</span>
              </li>
            </a>
            <hr />
            <a href="/">
              <li>
                Issues<span>1M</span>
              </li>
            </a>
            <hr />
            <a href="/">
              <li>
                Packages<span>2K</span>
              </li>
            </a>
            <hr />
            <a href="/">
              <li>
                Marketplace<span>552</span>
              </li>
            </a>
            <hr />
            <a href="/">
              <li>
                Topics<span>3K</span>
              </li>
            </a>
            <hr />
            <a href="/">
              <li>
                Wikis<span>22K</span>
              </li>
            </a>
            <hr />
            <a href="/">
              <li>
                Users<span>9K</span>
              </li>
            </a>
          </ul>
        </Itens>
        <Languages>
          <h4>Languages</h4>

          <ul>
            <li>
              <a href="/">
                <div>
                  <span>
                    JavaScript<strong>836,321</strong>
                  </span>
                </div>
              </a>
            </li>
            <li>
              <a href="/">
                <div>
                  <span>
                    TypeScript<strong>40,978</strong>
                  </span>
                </div>
              </a>
            </li>
            <li>
              <a href="/">
                <div>
                  <span>
                    HTML<strong>39,126</strong>
                  </span>
                </div>
              </a>
            </li>
            <li>
              <a href="/">
                <div>
                  <span>
                    CSS<strong>26,987</strong>
                  </span>
                </div>
              </a>
            </li>
            <li>
              <a href="/">
                <div>
                  <span>
                    Objective-C<strong>19,638</strong>
                  </span>
                </div>
              </a>
            </li>
            <li>
              <a href="/">
                <div>
                  <span>
                    Java<strong>13,998</strong>
                  </span>
                </div>
              </a>
            </li>
            <li>
              <a href="/">
                <div>
                  <span>
                    Ruby<strong>9,675</strong>
                  </span>
                </div>
              </a>
            </li>
            <li>
              <a href="/">
                <div>
                  <span>
                    Python<strong>5,385</strong>
                  </span>
                </div>
              </a>
            </li>
            <li>
              <a href="/">
                <div>
                  <span>
                    PHP<strong>4,487</strong>
                  </span>
                </div>
              </a>
            </li>
            <li>
              <a href="/">
                <div>
                  <span>
                    C#<strong>3,309</strong>
                  </span>
                </div>
              </a>
            </li>
          </ul>
        </Languages>
        <FooterAside>
          <ul>
            <div>
              <li>
                <a href="/">Advanced search</a>
              </li>
            </div>

            <li>
              <a href="/">Cheat sheet</a>
            </li>
          </ul>
        </FooterAside>
      </Aside>
      <Repositories>
        <SearchList />
      </Repositories>
    </Container>
  );
}
