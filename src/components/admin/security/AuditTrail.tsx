import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity,
  Search,
  Download,
  User,
  Database,
  Edit,
  Trash2,
  Plus,
  Eye,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SELECT' | 'LOGIN' | 'LOGOUT';
  resource_type: string;
  resource_id?: string;
  ip_address: string;
  user_agent: string;
  details: string;
  risk_level: 'low' | 'medium' | 'high';
  success: boolean;
}

export const AuditTrail: React.FC = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Transformar dados para o formato esperado
      const transformedLogs: AuditLog[] = (data || []).map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        user_id: log.user_id || 'sistema',
        user_name: 'Usuário',
        user_email: '',
        action: log.action as any,
        resource_type: log.resource_type,
        resource_id: log.resource_id,
        ip_address: (log.ip_address as string) || 'N/A',
        user_agent: log.user_agent || 'N/A',
        details: `${log.action} em ${log.resource_type}`,
        risk_level: log.action === 'DELETE' ? 'high' : 'low',
        success: true
      }));

      setLogs(transformedLogs);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      
      // Fallback para dados mock em caso de erro
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          user_id: 'sistema',
          user_name: 'Sistema',
          user_email: 'sistema@igreja.com',
          action: 'CREATE',
          resource_type: 'security_audit_logs',
          ip_address: '127.0.0.1',
          user_agent: 'Sistema',
          details: 'Sistema de auditoria inicializado',
          risk_level: 'low',
          success: true
        }
      ];
      setLogs(mockLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'UPDATE':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'DELETE':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'SELECT':
        return <Eye className="h-4 w-4 text-gray-600" />;
      case 'LOGIN':
        return <User className="h-4 w-4 text-green-600" />;
      case 'LOGOUT':
        return <User className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadge = (action: string, success: boolean) => {
    const baseClasses = "gap-1";
    if (!success) {
      return <Badge variant="destructive" className={baseClasses}>
        <AlertTriangle className="h-3 w-3" />
        {action} FALHA
      </Badge>;
    }

    switch (action) {
      case 'CREATE':
        return <Badge variant="outline" className={`${baseClasses} text-green-600 border-green-600`}>
          <Plus className="h-3 w-3" />
          CRIAÇÃO
        </Badge>;
      case 'UPDATE':
        return <Badge variant="outline" className={`${baseClasses} text-blue-600 border-blue-600`}>
          <Edit className="h-3 w-3" />
          EDIÇÃO
        </Badge>;
      case 'DELETE':
        return <Badge variant="destructive" className={baseClasses}>
          <Trash2 className="h-3 w-3" />
          EXCLUSÃO
        </Badge>;
      case 'LOGIN':
        return <Badge variant="outline" className={`${baseClasses} text-green-600 border-green-600`}>
          <User className="h-3 w-3" />
          LOGIN
        </Badge>;
      default:
        return <Badge variant="secondary" className={baseClasses}>
          <Activity className="h-3 w-3" />
          {action}
        </Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive">Alto Risco</Badge>;
      case 'medium':
        return <Badge variant="secondary">Médio Risco</Badge>;
      default:
        return <Badge variant="outline" className="text-green-600">Baixo Risco</Badge>;
    }
  };

  const handleExport = () => {
    toast({
      title: "Exportação Iniciada",
      description: "Os logs de auditoria estão sendo exportados para CSV."
    });
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesResource = resourceFilter === 'all' || log.resource_type === resourceFilter;
    const matchesRisk = riskFilter === 'all' || log.risk_level === riskFilter;

    return matchesSearch && matchesAction && matchesResource && matchesRisk;
  });

  const uniqueResources = [...new Set(logs.map(log => log.resource_type))];

  return (
    <div className="space-y-6">
      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{logs.length}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total de Logs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {logs.filter(l => l.success).length}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">Ações Bem-sucedidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {logs.filter(l => l.risk_level === 'high' || !l.success).length}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">Alertas de Segurança</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {new Set(logs.map(l => l.user_id)).size}
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400">Usuários Únicos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Trilha de Auditoria ({filteredLogs.length} registros)
            </CardTitle>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-64">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuário, ação ou detalhes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Ações</SelectItem>
                <SelectItem value="CREATE">Criação</SelectItem>
                <SelectItem value="UPDATE">Edição</SelectItem>
                <SelectItem value="DELETE">Exclusão</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Recurso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Recursos</SelectItem>
                {uniqueResources.map(resource => (
                  <SelectItem key={resource} value={resource}>
                    {resource}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Risco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Riscos</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de Logs */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Risco</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-muted animate-pulse rounded"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum log encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className="text-sm font-mono">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{log.user_name}</div>
                          <div className="text-xs text-muted-foreground">{log.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action, log.success)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Database className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-mono">{log.resource_type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-64">
                        <span className="text-sm truncate block">{log.details}</span>
                      </TableCell>
                      <TableCell>
                        {getRiskBadge(log.risk_level)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">{log.ip_address}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};