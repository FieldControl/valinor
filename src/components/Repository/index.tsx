import React from 'react';
import { FaRegStar, FaRegEye, FaChevronRight } from 'react-icons/fa';

import { Container, About, RepositoryData } from './styles';

interface IDataParams {
  data: IDataProps;
}

interface IDataProps {
  total_count: number;
  formatedCount: string;
  items: IRepositorieDataProps[];
}

interface IRepositorieDataProps {
  id: number;
  name: string;
  owner: {
    avatar_url: string;
    html_url: string;
  };
  description: string;
  stargazers_count: number;
  watchers_count: number;
  stargazers_format_count: string;
  watchers_format_count: string;
}

const Repository: React.FC<IDataParams> = ({ data }: IDataParams) => {
  const { items } = data;

  return (
    <>
      {items &&
        items.map(item => (
          <Container key={item.id}>
            <img src={item.owner.avatar_url} alt={item.name} />
            <About>
              <h1>{item.name}</h1>
              <p>{item.description}</p>
              <RepositoryData>
                <div>
                  <FaRegStar size={14} color="#3a3a3a" />
                  <p>{item.stargazers_format_count}</p>
                </div>

                <div>
                  <FaRegEye size={14} color="#3a3a3a" />
                  <p>{item.watchers_format_count}</p>
                </div>
              </RepositoryData>
            </About>
            <FaChevronRight size={14} color="#3a3a3a" />
          </Container>
        ))}
    </>
  );
};

export default Repository;
