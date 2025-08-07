import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRBAC } from '@/hooks/useRBAC';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Shield, Users, Settings, Eye, Crown } from 'lucide-react';

interface ProfileFormData {
  name: string;
  display_name: string;
  description: string;
  level: number;
  color: string;
  icon: string;
}

const ICON_OPTIONS = [
  { value: 'Shield', icon: Shield, label: 'Escudo' },
  { value: 'Crown', icon: Crown, label: 'Coroa' },
  { value: 'Users', icon: Users, label: 'Usuários' },
  { value: 'Settings', icon: Settings, label: 'Configurações' },
  { value: 'Eye', icon: Eye, label: 'Visualização' }
];

const COLOR_OPTIONS = [
  '#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#6b7280'
];

export const ProfilesManager: React.FC = () => {
  const { profiles, loading, createProfile, updateProfile, deleteProfile } = useRBAC();
  const { toast } = useToast();
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    display_name: '',
    description: '',
    level: 50,
    color: '#6366f1',
    icon: 'Shield'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      level: 50,
      color: '#6366f1',
      icon: 'Shield'
    });
  };

  const handleCreate = async () => {
    try {
      const result = await createProfile({
        ...formData,
        active: true,
        is_system: false
      });

      if (result) {
        toast({
          title: "Sucesso",
          description: "Perfil criado com sucesso!"
        });
        setIsCreateModalOpen(false);
        resetForm();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar perfil",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedProfile) return;

    try {
      const result = await updateProfile(selectedProfile.id, formData);

      if (result) {
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!"
        });
        setIsEditModalOpen(false);
        setSelectedProfile(null);
        resetForm();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (profileId: string) => {
    try {
      const success = await deleteProfile(profileId);

      if (success) {
        toast({
          title: "Sucesso",
          description: "Perfil excluído com sucesso!"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir perfil",
        variant: "destructive"
      });
    }
  };

  const openEditModal = (profile: any) => {
    setSelectedProfile(profile);
    setFormData({
      name: profile.name,
      display_name: profile.display_name,
      description: profile.description,
      level: profile.level,
      color: profile.color,
      icon: profile.icon
    });
    setIsEditModalOpen(true);
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = ICON_OPTIONS.find(opt => opt.value === iconName);
    return iconOption ? iconOption.icon : Shield;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Perfis</h2>
          <p className="text-muted-foreground">
            Gerencie os perfis de acesso do sistema
          </p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Perfil</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Sistema</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex: coordenador"
                  />
                </div>
                <div>
                  <Label htmlFor="display_name">Nome de Exibição</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="ex: Coordenador"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva as responsabilidades deste perfil"
                />
              </div>

              <div>
                <Label htmlFor="level">Nível de Acesso (1-100)</Label>
                <Input
                  id="level"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cor</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COLOR_OPTIONS.map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-foreground' : 'border-border'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Ícone</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ICON_OPTIONS.map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        className={`p-2 rounded border ${
                          formData.icon === value ? 'border-primary bg-primary/10' : 'border-border'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, icon: value }))}
                        title={label}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate}>
                  Criar Perfil
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map(profile => {
          const IconComponent = getIconComponent(profile.icon);
          
          return (
            <Card key={profile.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: profile.color }}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{profile.display_name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        Nível {profile.level}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(profile)}
                      disabled={profile.is_system}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    
                    {!profile.is_system && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o perfil "{profile.display_name}"?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(profile.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {profile.description}
                </p>
                
                {profile.is_system && (
                  <Badge variant="secondary" className="text-xs">
                    Perfil do Sistema
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_name">Nome do Sistema</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={selectedProfile?.is_system}
                />
              </div>
              <div>
                <Label htmlFor="edit_display_name">Nome de Exibição</Label>
                <Input
                  id="edit_display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_description">Descrição</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="edit_level">Nível de Acesso (1-100)</Label>
              <Input
                id="edit_level"
                type="number"
                min="1"
                max="100"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                disabled={selectedProfile?.is_system}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-foreground' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Ícone</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {ICON_OPTIONS.map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      className={`p-2 rounded border ${
                        formData.icon === value ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, icon: value }))}
                      title={label}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEdit}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};