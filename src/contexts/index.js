import { createContext, useState, useContext } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [isLogado, setLogado] = useState(() => {
    const token = localStorage.getItem('access_token');
    return !!token;
  });
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    return localStorage.getItem('ultimoLogado') || null;
  });

  const login = (token, usuario, nome) => {
    localStorage.setItem('access_token', JSON.stringify(token));
    localStorage.setItem('ultimoLogado', usuario?.toUpperCase());
    localStorage.setItem('nome_logado', nome);
    setLogado(true);
    setUsuarioLogado(usuario);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('ultimoLogado');
    localStorage.removeItem('nome_logado');
    setLogado(false);
    setUsuarioLogado(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isLogado, 
      setLogado,
      usuarioLogado, 
      setUsuarioLogado,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;