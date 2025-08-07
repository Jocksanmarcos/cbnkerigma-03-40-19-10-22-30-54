import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMinisterios } from '@/hooks/useMinisterios';
import { HeartHandshake, Users, Calendar, Plus, MapPin, Clock, Zap, CheckCircle, X } from 'lucide-react';

export const MinisteriosManager = () => {
  const { 
    ministries, 
    serviceOpportunities, 
    volunteerApplications,
    serviceSchedules,
    isLoading, 
    createMinistry, 
    createServiceOpportunity,
    updateApplicationStatus
  } = useMinisterios();
  
  const [newMinistry, setNewMinistry] = useState({
    name: '',
    description: '',
    icon: '🙏',
    color: '#6366f1',
    meeting_day: '',
    meeting_time: '',
    location: '',
    requirements: [] as string[]
  });

  const [newOpportunity, setNewOpportunity] = useState({
    ministry_id: '',
    title: '',
    description: '',
    required_skills: [] as string[],
    preferred_skills: [] as string[],
    time_commitment: '',
    schedule_details: '',
    slots_needed: 1,
    is_urgent: false
  });

  const [showMinistryDialog, setShowMinistryDialog] = useState(false);
  const [showOpportunityDialog, setShowOpportunityDialog] = useState(false);

  const handleCreateMinistry = async () => {
    try {
      await createMinistry(newMinistry);
      setNewMinistry({
        name: '',
        description: '',
        icon: '🙏',
        color: '#6366f1',
        meeting_day: '',
        meeting_time: '',
        location: '',
        requirements: []
      });
      setShowMinistryDialog(false);
    } catch (error) {
      console.error('Erro ao criar ministério:', error);
    }
  };

  const handleCreateOpportunity = async () => {
    try {
      await createServiceOpportunity(newOpportunity);
      setNewOpportunity({
        ministry_id: '',
        title: '',
        description: '',
        required_skills: [],
        preferred_skills: [],
        time_commitment: '',
        schedule_details: '',
        slots_needed: 1,
        is_urgent: false
      });
      setShowOpportunityDialog(false);
    } catch (error) {
      console.error('Erro ao criar oportunidade:', error);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      await updateApplicationStatus(applicationId, 'approved', 'Candidatura aprovada pela liderança');
    } catch (error) {
      console.error('Erro ao aprovar candidatura:', error);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      await updateApplicationStatus(applicationId, 'rejected', 'Candidatura não aprovada neste momento');
    } catch (error) {
      console.error('Erro ao rejeitar candidatura:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      withdrawn: 'bg-gray-100 text-gray-700'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ministérios & Voluntários</h1>
          <p className="text-muted-foreground">
            Gerencie ministérios, oportunidades de serviço e voluntários
          </p>
        </div>
      </div>

      <Tabs defaultValue="ministries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ministries" className="flex items-center gap-2">
            <HeartHandshake className="h-4 w-4" />
            Ministérios
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Oportunidades
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Candidaturas
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Escalas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ministries" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Ministérios da Igreja</h2>
            <Dialog open={showMinistryDialog} onOpenChange={setShowMinistryDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Ministério
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Novo Ministério</DialogTitle>
                  <DialogDescription>
                    Configure um novo ministério da igreja
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ministry-name">Nome do Ministério</Label>
                    <Input
                      id="ministry-name"
                      value={newMinistry.name}
                      onChange={(e) => setNewMinistry(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Ministério de Louvor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ministry-description">Descrição</Label>
                    <Textarea
                      id="ministry-description"
                      value={newMinistry.description}
                      onChange={(e) => setNewMinistry(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do ministério..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ministry-icon">Ícone</Label>
                      <Input
                        id="ministry-icon"
                        value={newMinistry.icon}
                        onChange={(e) => setNewMinistry(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="🙏"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ministry-color">Cor</Label>
                      <Input
                        id="ministry-color"
                        type="color"
                        value={newMinistry.color}
                        onChange={(e) => setNewMinistry(prev => ({ ...prev, color: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ministry-location">Local de Reunião</Label>
                    <Input
                      id="ministry-location"
                      value={newMinistry.location}
                      onChange={(e) => setNewMinistry(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Local onde o ministério se reúne"
                    />
                  </div>
                  <Button onClick={handleCreateMinistry} className="w-full">
                    Criar Ministério
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {ministries.map((ministry) => (
              <Card key={ministry.id} className="platform-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: ministry.color + '20', color: ministry.color }}
                    >
                      {ministry.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{ministry.name}</CardTitle>
                      {ministry.leader && (
                        <p className="text-sm text-muted-foreground">
                          Líder: {ministry.leader.nome_completo}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ministry.description && (
                    <p className="text-sm text-muted-foreground">{ministry.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {ministry.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {ministry.location}
                      </div>
                    )}
                    {ministry.meeting_day && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {ministry.meeting_day}
                      </div>
                    )}
                    {ministry.meeting_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {ministry.meeting_time}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {ministry.volunteer_count || 0} voluntários
                      </span>
                    </div>
                    <Badge variant="outline">Ativo</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Oportunidades de Serviço</h2>
            <Dialog open={showOpportunityDialog} onOpenChange={setShowOpportunityDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Oportunidade
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Criar Oportunidade de Serviço</DialogTitle>
                  <DialogDescription>
                    Publique uma nova vaga para voluntários
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="opportunity-ministry">Ministério</Label>
                    <Select value={newOpportunity.ministry_id} onValueChange={(value) => setNewOpportunity(prev => ({ ...prev, ministry_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ministério" />
                      </SelectTrigger>
                      <SelectContent>
                        {ministries.map((ministry) => (
                          <SelectItem key={ministry.id} value={ministry.id}>
                            {ministry.icon} {ministry.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="opportunity-title">Título da Oportunidade</Label>
                    <Input
                      id="opportunity-title"
                      value={newOpportunity.title}
                      onChange={(e) => setNewOpportunity(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Músico para Ministério de Louvor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="opportunity-description">Descrição</Label>
                    <Textarea
                      id="opportunity-description"
                      value={newOpportunity.description}
                      onChange={(e) => setNewOpportunity(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva a oportunidade de serviço..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="opportunity-slots">Vagas Necessárias</Label>
                    <Input
                      id="opportunity-slots"
                      type="number"
                      min="1"
                      value={newOpportunity.slots_needed}
                      onChange={(e) => setNewOpportunity(prev => ({ ...prev, slots_needed: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="opportunity-commitment">Comprometimento de Tempo</Label>
                    <Select value={newOpportunity.time_commitment} onValueChange={(value) => setNewOpportunity(prev => ({ ...prev, time_commitment: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="occasional">Esporádico</SelectItem>
                        <SelectItem value="event_based">Por Eventos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateOpportunity} className="w-full">
                    Publicar Oportunidade
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {serviceOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="platform-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                        {opportunity.is_urgent && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Urgente
                          </Badge>
                        )}
                      </div>
                      {opportunity.ministry && (
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-5 h-5 rounded flex items-center justify-center text-xs"
                            style={{ backgroundColor: opportunity.ministry.color + '20', color: opportunity.ministry.color }}
                          >
                            {opportunity.ministry.icon}
                          </span>
                          <span className="text-sm text-muted-foreground">{opportunity.ministry.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {opportunity.slots_filled}/{opportunity.slots_needed}
                      </div>
                      <div className="text-xs text-muted-foreground">vagas</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {opportunity.description && (
                    <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {opportunity.required_skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  {opportunity.time_commitment && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {opportunity.time_commitment}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <h2 className="text-lg font-semibold">Candidaturas Pendentes</h2>
          <div className="grid gap-4">
            {volunteerApplications.filter(app => app.status === 'pending').map((application) => (
              <Card key={application.id} className="platform-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">
                        {application.service_opportunity?.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {application.user?.nome_completo}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApproveApplication(application.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleRejectApplication(application.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {application.message && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      <strong>Mensagem:</strong> {application.message}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <h2 className="text-lg font-semibold">Escalas de Serviço</h2>
          <div className="grid gap-4">
            {serviceSchedules.map((schedule) => (
              <Card key={schedule.id} className="platform-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{schedule.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(schedule.event_date).toLocaleDateString()}
                        </div>
                        {schedule.event_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {schedule.event_time}
                          </div>
                        )}
                        {schedule.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {schedule.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={schedule.status === 'published' ? 'default' : 'secondary'}
                    >
                      {schedule.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                {schedule.volunteers && schedule.volunteers.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Voluntários Designados:</h4>
                      <div className="space-y-1">
                        {schedule.volunteers.map((volunteer, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{volunteer.volunteer.nome_completo}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {volunteer.role}
                              </Badge>
                              <Badge 
                                className={`text-xs ${getStatusColor(volunteer.status)}`}
                              >
                                {volunteer.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};