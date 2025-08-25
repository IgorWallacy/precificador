import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import LottieAnimation from '../../../../assets/img/vendas.json'; 
import './styles.css';

const EmptyState = ({ message }) => {
  return (
    <div className="empty-state-container">
      <Player
        src={LottieAnimation}
        loop
        autoplay
        style={{ width: '200px', height: '200px' }}
      />
      <p className="empty-state-message">{message || 'Nenhum dado encontrado para os filtros selecionados.'}</p>
    </div>
  );
};

export default EmptyState;
