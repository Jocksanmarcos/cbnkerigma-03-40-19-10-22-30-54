import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionBasedContent, ModuleAccessWrapper, ActionButton, AdminOnly, LeaderOnly } from '@/components/portal/PermissionBasedContent';
import { usePermissions } from '@/hooks/usePermissions';

export const PermissionExample: React.FC = () => {
  const { userRole, getAccessibleModules } = usePermissions();
  const accessibleModules = getAccessibleModules();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Permissões - CBN Kerigma</CardTitle>
          <CardDescription>
            Seu papel atual: <strong>{userRole}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Módulo de Pessoas */}
            <ModuleAccessWrapper modulo="pessoas">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    👥 Pessoas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ActionButton
                    modulo="pessoas"
                    acao="visualizar"
                    className="w-full bg-blue-600 text-white p-2 rounded"
                  >
                    Ver Pessoas
                  </ActionButton>
                  
                  <ActionButton
                    modulo="pessoas"
                    acao="criar"
                    className="w-full bg-green-600 text-white p-2 rounded"
                  >
                    Cadastrar Pessoa
                  </ActionButton>
                  
                  <ActionButton
                    modulo="pessoas"
                    acao="editar"
                    className="w-full bg-yellow-600 text-white p-2 rounded"
                  >
                    Editar Dados
                  </ActionButton>
                  
                  <ActionButton
                    modulo="pessoas"
                    acao="excluir"
                    className="w-full bg-red-600 text-white p-2 rounded"
                  >
                    Excluir Pessoa
                  </ActionButton>
                </CardContent>
              </Card>
            </ModuleAccessWrapper>

            {/* Módulo de Finanças */}
            <ModuleAccessWrapper modulo="financas">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    💰 Finanças
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ActionButton
                    modulo="financas"
                    acao="visualizar"
                    className="w-full bg-blue-600 text-white p-2 rounded"
                  >
                    Ver Relatórios
                  </ActionButton>
                  
                  <ActionButton
                    modulo="financas"
                    acao="criar"
                    className="w-full bg-green-600 text-white p-2 rounded"
                  >
                    Novo Lançamento
                  </ActionButton>
                  
                  <ActionButton
                    modulo="financas"
                    acao="exportar"
                    className="w-full bg-purple-600 text-white p-2 rounded"
                  >
                    Exportar Dados
                  </ActionButton>
                </CardContent>
              </Card>
            </ModuleAccessWrapper>

            {/* Módulo de Ensino */}
            <ModuleAccessWrapper modulo="ensino">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📚 Ensino
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ActionButton
                    modulo="ensino"
                    acao="visualizar"
                    className="w-full bg-blue-600 text-white p-2 rounded"
                  >
                    Ver Cursos
                  </ActionButton>
                  
                  <ActionButton
                    modulo="ensino"
                    acao="criar"
                    className="w-full bg-green-600 text-white p-2 rounded"
                  >
                    Criar Curso
                  </ActionButton>
                  
                  <ActionButton
                    modulo="ensino"
                    acao="gerenciar"
                    className="w-full bg-indigo-600 text-white p-2 rounded"
                  >
                    Gerenciar Turmas
                  </ActionButton>
                </CardContent>
              </Card>
            </ModuleAccessWrapper>

            {/* Módulo de Células */}
            <ModuleAccessWrapper modulo="celulas">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🏠 Células
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ActionButton
                    modulo="celulas"
                    acao="visualizar"
                    className="w-full bg-blue-600 text-white p-2 rounded"
                  >
                    Ver Células
                  </ActionButton>
                  
                  <ActionButton
                    modulo="celulas"
                    acao="editar"
                    className="w-full bg-yellow-600 text-white p-2 rounded"
                  >
                    Editar Célula
                  </ActionButton>
                  
                  <PermissionBasedContent
                    modulo="celulas"
                    acao="visualizar"
                    conditions={{ scope: "celula" }}
                  >
                    <Button className="w-full bg-orange-600 text-white">
                      Ver Minha Célula
                    </Button>
                  </PermissionBasedContent>
                </CardContent>
              </Card>
            </ModuleAccessWrapper>

            {/* Portal do Aluno - Disponível para todos */}
            <ModuleAccessWrapper modulo="portal_aluno">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📖 Portal do Aluno
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ActionButton
                    modulo="portal_aluno"
                    acao="visualizar"
                    className="w-full bg-blue-600 text-white p-2 rounded"
                  >
                    Acessar Portal
                  </ActionButton>
                </CardContent>
              </Card>
            </ModuleAccessWrapper>

            {/* Dashboard Estratégico - Só para líderes */}
            <ModuleAccessWrapper modulo="dashboard_estrategico">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📊 Dashboard Estratégico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ActionButton
                    modulo="dashboard_estrategico"
                    acao="visualizar"
                    className="w-full bg-blue-600 text-white p-2 rounded"
                  >
                    Ver Indicadores
                  </ActionButton>
                </CardContent>
              </Card>
            </ModuleAccessWrapper>
          </div>

          {/* Seções específicas por nível */}
          <div className="mt-8 space-y-4">
            <LeaderOnly>
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-800">Área de Liderança</CardTitle>
                  <CardDescription>Funcionalidades exclusivas para líderes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-700">
                    Como líder, você tem acesso a relatórios e ferramentas de gestão especiais.
                  </p>
                </CardContent>
              </Card>
            </LeaderOnly>

            <AdminOnly>
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800">Área Administrativa</CardTitle>
                  <CardDescription>Funcionalidades exclusivas para administradores</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700">
                    Como administrador, você tem acesso total ao sistema e pode gerenciar usuários e permissões.
                  </p>
                </CardContent>
              </Card>
            </AdminOnly>
          </div>

          {/* Lista de módulos acessíveis */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Módulos Acessíveis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {accessibleModules.map((module) => (
                <div
                  key={module.id}
                  className="p-2 bg-gray-100 rounded text-sm text-center"
                >
                  {module.nome}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};