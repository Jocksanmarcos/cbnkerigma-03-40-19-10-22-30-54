import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se há tokens de reset na URL atual
    const fullUrl = window.location.href;
    const hasRecovery = fullUrl.includes('type=recovery') || fullUrl.includes('access_token=');
    
    if (hasRecovery) {
      console.log('🔍 Token de reset detectado na página 404, redirecionando para /reset');
      console.log('URL completa:', fullUrl);
      
      // Redirecionar para /reset preservando todos os parâmetros
      const newUrl = fullUrl.replace(location.pathname, '/reset');
      window.location.href = newUrl;
      return;
    }

    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Não encontrado</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Página não encontrada</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Voltar para o Início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
