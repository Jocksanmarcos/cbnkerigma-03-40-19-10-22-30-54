import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const usePasswordResetRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAndRedirectReset = () => {
      const fullUrl = window.location.href;
      const currentPath = location.pathname;
      
      // Verificar se há tokens de reset na URL
      const hasRecovery = fullUrl.includes('type=recovery') || fullUrl.includes('access_token=');
      const isAlreadyOnResetPage = currentPath === '/reset';
      
      if (hasRecovery && !isAlreadyOnResetPage) {
        console.log('🔄 [usePasswordResetRedirect] Token de reset detectado, redirecionando...');
        console.log('Página atual:', currentPath);
        console.log('URL completa:', fullUrl);
        
        // Preservar todos os parâmetros na URL
        const newUrl = fullUrl.replace(currentPath, '/reset');
        
        // Usar replace para não criar histórico desnecessário
        window.location.replace(newUrl);
      }
    };

    // Verificar imediatamente
    checkAndRedirectReset();
    
    // Verificar também se a URL mudar (para casos edge)
    const handleUrlChange = () => {
      setTimeout(checkAndRedirectReset, 100);
    };

    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [location.pathname, navigate]);
};