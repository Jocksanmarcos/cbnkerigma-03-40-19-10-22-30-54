import { useState } from 'react';
import { CalendarCheck, Users, MapPin, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEnsinoCompleto } from '@/hooks/useEnsinoCompleto';
import { useBloqueiosAcademicos, ConfliteTurma } from '@/hooks/useBloqueiosAcademicos';
import { useToast } from '@/hooks/use-toast';

interface DadosTurma {
  nome_turma: string;
  curso_id: string;
  professor_responsavel: string;
  data_inicio: string;
  data_fim: string;
  dias_semana: string[];
  horario_inicio: string;
  horario_fim: string;
  local_tipo: 'presencial' | 'online' | 'hibrido';
  local_endereco?: string;
  link_online?: string;
  capacidade_maxima: number;
  lista_espera: boolean;
  observacoes?: string;
  status: string;
}

const diasSemanaOptions = [
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

export const AgendarTurma = () => {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [dadosTurma, setDadosTurma] = useState<DadosTurma>({
    nome_turma: '',
    curso_id: '',
    professor_responsavel: '',
    data_inicio: '',
    data_fim: '',
    dias_semana: [],
    horario_inicio: '',
    horario_fim: '',
    local_tipo: 'presencial',
    capacidade_maxima: 20,
    lista_espera: false,
    status: 'planejado',
  });
  const [conflitos, setConflitos] = useState<ConfliteTurma[]>([]);
  
  const { cursos, createTurma, loading } = useEnsinoCompleto();
  const { verificarConflitos } = useBloqueiosAcademicos();
  const { toast } = useToast();

  const etapas = [
    { numero: 1, titulo: 'Selecionar Curso', icone: CalendarCheck },
    { numero: 2, titulo: 'Informações da Turma', icone: Users },
    { numero: 3, titulo: 'Atribuir Equipe', icone: Users },
    { numero: 4, titulo: 'Configurar Cronograma', icone: Clock },
    { numero: 5, titulo: 'Revisão e Confirmação', icone: CheckCircle },
  ];

  const handleNext = () => {
    if (etapaAtual < 5) {
      setEtapaAtual(etapaAtual + 1);
    }
  };

  const handlePrev = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await createTurma(dadosTurma);
      if (result.error) {
        toast({
          title: "Erro",
          description: "Erro ao criar turma",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Turma criada com sucesso!",
        });
        // Reset form
        setDadosTurma({
          nome_turma: '',
          curso_id: '',
          professor_responsavel: '',
          data_inicio: '',
          data_fim: '',
          dias_semana: [],
          horario_inicio: '',
          horario_fim: '',
          local_tipo: 'presencial',
          capacidade_maxima: 20,
          lista_espera: false,
          status: 'planejado',
        });
        setEtapaAtual(1);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar turma",
        variant: "destructive",
      });
    }
  };

  const handleDiasSemanaChange = (dia: string, checked: boolean) => {
    if (checked) {
      setDadosTurma(prev => ({
        ...prev,
        dias_semana: [...prev.dias_semana, dia]
      }));
    } else {
      setDadosTurma(prev => ({
        ...prev,
        dias_semana: prev.dias_semana.filter(d => d !== dia)
      }));
    }
  };

  // Verificar conflitos usando a função do banco
  const verificarConflitosReal = async () => {
    if (!dadosTurma.professor_responsavel || !dadosTurma.data_inicio || !dadosTurma.data_fim) {
      setConflitos([]);
      return;
    }

    const conflitosEncontrados = await verificarConflitos(
      dadosTurma.professor_responsavel,
      dadosTurma.dias_semana,
      dadosTurma.horario_inicio,
      dadosTurma.horario_fim,
      dadosTurma.data_inicio,
      dadosTurma.data_fim
    );
    
    setConflitos(conflitosEncontrados);
  };

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="curso">Selecionar Curso</Label>
              <Select
                value={dadosTurma.curso_id}
                onValueChange={(value) => setDadosTurma(prev => ({ ...prev, curso_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map((curso) => (
                    <SelectItem key={curso.id} value={curso.id}>
                      {curso.nome} - {curso.categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {dadosTurma.curso_id && (
              <div className="p-4 border rounded-lg bg-muted/50">
                {(() => {
                  const cursoSelecionado = cursos.find(c => c.id === dadosTurma.curso_id);
                  return cursoSelecionado ? (
                    <div>
                      <h4 className="font-medium">{cursoSelecionado.nome}</h4>
                      <p className="text-sm text-muted-foreground">{cursoSelecionado.descricao}</p>
                      <div className="mt-2 flex gap-2">
                        <Badge>{cursoSelecionado.categoria}</Badge>
                        <Badge variant="outline">{cursoSelecionado.nivel}</Badge>
                        {cursoSelecionado.carga_horaria && (
                          <Badge variant="outline">{cursoSelecionado.carga_horaria}h</Badge>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome_turma">Nome da Turma</Label>
              <Input
                id="nome_turma"
                value={dadosTurma.nome_turma}
                onChange={(e) => setDadosTurma(prev => ({ ...prev, nome_turma: e.target.value }))}
                placeholder="Ex: Discipulado Básico - Turma A"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={dadosTurma.data_inicio}
                  onChange={(e) => setDadosTurma(prev => ({ ...prev, data_inicio: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="data_fim">Data de Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={dadosTurma.data_fim}
                  onChange={(e) => setDadosTurma(prev => ({ ...prev, data_fim: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label>Dias da Semana</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {diasSemanaOptions.map((dia) => (
                  <div key={dia.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={dia.value}
                      checked={dadosTurma.dias_semana.includes(dia.value)}
                      onCheckedChange={(checked) => handleDiasSemanaChange(dia.value, checked as boolean)}
                    />
                    <Label htmlFor={dia.value} className="text-sm">
                      {dia.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="horario_inicio">Horário de Início</Label>
                <Input
                  id="horario_inicio"
                  type="time"
                  value={dadosTurma.horario_inicio}
                  onChange={(e) => setDadosTurma(prev => ({ ...prev, horario_inicio: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="horario_fim">Horário de Fim</Label>
                <Input
                  id="horario_fim"
                  type="time"
                  value={dadosTurma.horario_fim}
                  onChange={(e) => setDadosTurma(prev => ({ ...prev, horario_fim: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="professor">Professor Responsável</Label>
              <Input
                id="professor"
                value={dadosTurma.professor_responsavel}
                onChange={(e) => setDadosTurma(prev => ({ ...prev, professor_responsavel: e.target.value }))}
                placeholder="Nome do professor"
              />
            </div>
            
            <div>
              <Label>Tipo de Local</Label>
              <Select
                value={dadosTurma.local_tipo}
                onValueChange={(value: 'presencial' | 'online' | 'hibrido') => 
                  setDadosTurma(prev => ({ ...prev, local_tipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {(dadosTurma.local_tipo === 'presencial' || dadosTurma.local_tipo === 'hibrido') && (
              <div>
                <Label htmlFor="local_endereco">Endereço/Local</Label>
                <Input
                  id="local_endereco"
                  value={dadosTurma.local_endereco || ''}
                  onChange={(e) => setDadosTurma(prev => ({ ...prev, local_endereco: e.target.value }))}
                  placeholder="Ex: Sala 1, Auditório, etc."
                />
              </div>
            )}
            
            {(dadosTurma.local_tipo === 'online' || dadosTurma.local_tipo === 'hibrido') && (
              <div>
                <Label htmlFor="link_online">Link Online</Label>
                <Input
                  id="link_online"
                  value={dadosTurma.link_online || ''}
                  onChange={(e) => setDadosTurma(prev => ({ ...prev, link_online: e.target.value }))}
                  placeholder="Link do Zoom, Meet, etc."
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="capacidade">Capacidade Máxima</Label>
              <Input
                id="capacidade"
                type="number"
                value={dadosTurma.capacidade_maxima}
                onChange={(e) => setDadosTurma(prev => ({ ...prev, capacidade_maxima: parseInt(e.target.value) }))}
                min="1"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lista_espera"
                checked={dadosTurma.lista_espera}
                onCheckedChange={(checked) => setDadosTurma(prev => ({ ...prev, lista_espera: checked as boolean }))}
              />
              <Label htmlFor="lista_espera">Permitir lista de espera</Label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Cronograma Sugerido</h4>
              <p className="text-sm text-muted-foreground">
                Baseado nas informações fornecidas, sugerimos o seguinte cronograma:
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Período:</span>
                  <span>{dadosTurma.data_inicio} a {dadosTurma.data_fim}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dias:</span>
                  <span>{dadosTurma.dias_semana.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Horário:</span>
                  <span>{dadosTurma.horario_inicio} às {dadosTurma.horario_fim}</span>
                </div>
                <div className="flex justify-between">
                  <span>Local:</span>
                  <span>
                    {dadosTurma.local_tipo === 'presencial' && dadosTurma.local_endereco}
                    {dadosTurma.local_tipo === 'online' && 'Online'}
                    {dadosTurma.local_tipo === 'hibrido' && 'Híbrido'}
                  </span>
                </div>
              </div>
            </div>
            
            <Button onClick={verificarConflitosReal} variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Verificar Conflitos
            </Button>
            
            {conflitos.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <p className="font-medium">Conflitos encontrados:</p>
                    <ul className="mt-1 space-y-1">
                      {conflitos.map((conflito, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            conflito.gravidade === 3 ? 'bg-red-500' :
                            conflito.gravidade === 2 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                          {conflito.descricao}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={dadosTurma.observacoes || ''}
                onChange={(e) => setDadosTurma(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações adicionais sobre a turma..."
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Revisão Final</h4>
              <p className="text-sm text-muted-foreground">
                Verifique todas as informações antes de confirmar
              </p>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações da Turma</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Nome:</span>
                      <p>{dadosTurma.nome_turma}</p>
                    </div>
                    <div>
                      <span className="font-medium">Professor:</span>
                      <p>{dadosTurma.professor_responsavel}</p>
                    </div>
                    <div>
                      <span className="font-medium">Período:</span>
                      <p>{dadosTurma.data_inicio} a {dadosTurma.data_fim}</p>
                    </div>
                    <div>
                      <span className="font-medium">Capacidade:</span>
                      <p>{dadosTurma.capacidade_maxima} alunos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {conflitos.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum conflito encontrado. Turma pronta para ser criada!
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Existem conflitos que precisam ser resolvidos antes de continuar.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Agendar Nova Turma</h2>
        <p className="text-muted-foreground">
          Siga o assistente para criar e agendar uma nova turma
        </p>
      </div>

      {/* Indicador de etapas */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {etapas.map((etapa, index) => (
              <div key={etapa.numero} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  etapaAtual >= etapa.numero ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {etapaAtual > etapa.numero ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    etapa.numero
                  )}
                </div>
                <div className="ml-2">
                  <p className={`text-sm font-medium ${
                    etapaAtual >= etapa.numero ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {etapa.titulo}
                  </p>
                </div>
                {index < etapas.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    etapaAtual > etapa.numero ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo da etapa atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const etapa = etapas.find(e => e.numero === etapaAtual);
              return etapa ? <etapa.icone className="h-5 w-5" /> : null;
            })()}
            Etapa {etapaAtual}: {etapas.find(e => e.numero === etapaAtual)?.titulo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderEtapa()}
        </CardContent>
      </Card>

      {/* Botões de navegação */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={etapaAtual === 1}
        >
          Anterior
        </Button>
        
        <div className="flex gap-2">
          {etapaAtual === 5 ? (
            <Button
              onClick={handleSubmit}
              disabled={loading || conflitos.length > 0}
            >
              {loading ? 'Criando...' : 'Confirmar e Criar Turma'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={
                (etapaAtual === 1 && !dadosTurma.curso_id) ||
                (etapaAtual === 2 && (!dadosTurma.nome_turma || !dadosTurma.data_inicio)) ||
                (etapaAtual === 3 && !dadosTurma.professor_responsavel)
              }
            >
              Próximo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};