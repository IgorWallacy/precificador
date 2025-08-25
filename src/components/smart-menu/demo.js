import React from 'react';
import SmartMenu from './index';

const SmartMenuDemo = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🚀 Demonstração do Menu Inteligente
      </h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#666', marginBottom: '15px' }}>
          Menu Inteligente Integrado
        </h2>
        <SmartMenu />
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#666', marginBottom: '15px' }}>
          📋 Funcionalidades Implementadas
        </h2>
        <ul style={{ color: '#555', lineHeight: '1.6' }}>
          <li>✅ <strong>Ações mais usadas</strong> sempre visíveis à esquerda</li>
          <li>✅ <strong>Menu completo do sidebar</strong> com rolagem horizontal</li>
          <li>✅ <strong>Sistema de rolagem</strong> com botões de navegação</li>
          <li>✅ <strong>Estado ativo</strong> para indicar página atual</li>
          <li>✅ <strong>Prevenção de navegação</strong> quando já está na rota</li>
          <li>✅ <strong>Design responsivo</strong> para diferentes tamanhos de tela</li>
          <li>✅ <strong>Animações suaves</strong> e efeitos hover</li>
          <li>✅ <strong>Tooltips informativos</strong> para cada ação</li>
          <li>✅ <strong>Separador visual</strong> entre seções</li>
          <li>✅ <strong>Acessibilidade</strong> com indicadores de foco</li>
        </ul>
      </div>
    </div>
  );
};

export default SmartMenuDemo;
