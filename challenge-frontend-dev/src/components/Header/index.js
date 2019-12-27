import React from 'react';

import { FaGithub } from 'react-icons/fa';
import { FaBell } from 'react-icons/fa';
import { FaSortDown } from 'react-icons/fa';
import { FaPlus } from 'react-icons/fa';
import avatar from '../../assets/avatar.jpg';

import { Container, Content, Info } from './styles.js';

export default function Header() {
  return (
    <Container>
      <Content>
        <nav>
          <a href="/">
            <FaGithub size={33} color="#fff" />
          </a>
          <input type="type" placeholder="Search or jump to..." disabled />

          <ul>
            <li>
              <a href="/">Pull requests</a>
            </li>
            <li>
              <a href="/">Issues</a>
            </li>
            <li>
              <a href="/">Marketplace</a>
            </li>
            <li>
              <a href="/">Explore</a>
            </li>
          </ul>
        </nav>

        <aside>
          <Info>
            <div>
              <ul>
                <li>
                  <a href="/">
                    <FaBell size={17} color="#fff" />
                  </a>
                </li>
                <li>
                  <a href="/">
                    <FaPlus size={16} color="#fff" />
                    <FaSortDown size={15} color="#fff" />
                  </a>
                </li>
                <li>
                  <a href="/">
                    <img src={avatar} alt="Avatar" />
                    <FaSortDown size={15} color="#fff" />
                  </a>
                </li>
              </ul>
            </div>
          </Info>
        </aside>
      </Content>
    </Container>
  );
}
