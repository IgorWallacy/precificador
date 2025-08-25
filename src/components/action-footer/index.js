import React from 'react';
import { Toolbar } from 'primereact/toolbar';
import './styles.css';

const ActionFooter = ({ 
  leftContent, 
  rightContent, 
  centerContent,
  className = '',
  style = {},
  position = 'relative' // 'fixed', 'sticky', 'relative'
}) => {
  const footerClasses = `action-footer ${className} ${position === 'fixed' ? 'action-footer-fixed' : ''} ${position === 'sticky' ? 'action-footer-sticky' : ''}`;

  return (
    <div className={footerClasses} style={style}>
      <Toolbar
        className="action-footer-toolbar"
        left={leftContent}
        center={centerContent}
        right={rightContent}
      />
    </div>
  );
};

export default ActionFooter;