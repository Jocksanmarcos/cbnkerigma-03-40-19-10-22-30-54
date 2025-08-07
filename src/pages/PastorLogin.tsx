import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginPastorMissao } from '@/components/admin/missoes/LoginPastorMissao';

const PastorLogin = () => {
  const { isAuthenticated, isPastorMissao, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated as pastor
  useEffect(() => {
    if (isAuthenticated && isPastorMissao && !loading) {
      navigate('/admin');
    }
  }, [isAuthenticated, isPastorMissao, loading, navigate]);

  return <LoginPastorMissao />;
};

export default PastorLogin;