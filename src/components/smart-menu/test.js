// Teste do componente SmartMenu
// Este arquivo pode ser usado para testes manuais

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SmartMenu from './index';

// Mock do useNavigate
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/test' })
}));

// Teste básico de renderização
describe('SmartMenu', () => {
  it('deve renderizar sem erros', () => {
    const { container } = render(
      <BrowserRouter>
        <SmartMenu />
      </BrowserRouter>
    );
    
    expect(container).toBeInTheDocument();
  });

  it('deve exibir ações frequentes', () => {
    const { getByText } = render(
      <BrowserRouter>
        <SmartMenu />
      </BrowserRouter>
    );
    
    expect(getByText('Agendar\nPreços')).toBeInTheDocument();
    expect(getByText('Emitir\nEtiquetas')).toBeInTheDocument();
  });
});

// Para executar os testes:
// npm test -- --testPathPattern=smart-menu
