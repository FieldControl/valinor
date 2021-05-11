import styled from 'styled-components';

export const Container = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 2rem 0;

  img + a {
    display: flex;
    align-items: center;

    font-size: 1rem;
    font-weight: 700;

    color: var(--text-info);

    transition: filter 0.2s;

    &:hover {
      filter: brightness(0.9);
    }
  }
`;
