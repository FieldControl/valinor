import { ReactNode } from 'react';
import logoImg from '../../images/Logo.svg';
import { Container } from './styles';

interface IHeaderProps {
  children?: ReactNode;
}

export function Header({ children }: IHeaderProps) {
  return (
    <Container>
      <img src={logoImg} alt="github_explore logo" />

      {children}
    </Container>
  );
}
