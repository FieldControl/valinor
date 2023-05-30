"use client";
// stilização manual para deixar um efeito de envio no input
import { styled } from '@nextui-org/react';


// stylo da animação do botao no input
export const SendButton = styled('button', {
  // reseta o style do botao
  background: 'transparent',
  border: 'none',
  padding: 0,
  // styles
  width: '24px',
  margin: '0 10px',
  dflex: 'center',
  bg: '$primary',
  borderRadius: '$rounded',
  cursor: 'pointer',
  transition: 'opacity 0.25s ease 0s, transform 0.25s ease 0s',
  svg: {
    size: '100%',
    padding: '4px',
    transition: 'transform 0.25s ease 0s, opacity 200ms ease-in-out 50ms',
    boxShadow: '0 5px 20px -5px rgba(0, 0, 0, 0.1)',
  },
  '&:hover': {
    opacity: 0.8
  },
  // animação
  '&:active': {  
    transform: 'scale(0.9)',
    svg: {
      transform: 'translate(24px, -24px)',
      opacity: 0
    }
  }
});
