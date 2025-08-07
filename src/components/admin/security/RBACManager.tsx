import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfilesManager } from './ProfilesManager';
import { PermissionMatrix } from './PermissionMatrix';
import { PermissionsSummary } from './PermissionsSummary';
import { useRBAC } from '@/hooks/useRBAC';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Search, Plus, Settings, ChevronRight, BarChart3 } from 'lucide-react';

export const RBACManager: React.FC = () => {
  const { profiles, loading } = useRBAC();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfilesManager, setShowProfilesManager] = useState(false);
  const [activeView, setActiveView] = useState<'matrix' | 'analytics'>('matrix');

  const filteredProfiles = profiles.filter(profile =>
    profile.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showProfilesManager) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button 
            onClick={() => setShowProfilesManager(false)}
            className="hover:text-foreground transition-colors"
          >
            Perfis & Permissões
          </button>
          <ChevronRight className="h-4 w-4" />
          <span>Gestão de Perfis</span>
        </div>
        <ProfilesManager />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Perfis & Permissões</h1>
            <p className="text-muted-foreground">
              Controle granular de acesso - {profiles.length} perfis configurados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'matrix' | 'analytics')}>
            <TabsList>
              <TabsTrigger value="matrix">Matriz</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button onClick={() => setShowProfilesManager(true)} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Gerenciar Perfis
          </Button>
        </div>
      </div>

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <div className="space-y-6">
          <PermissionsSummary />
        </div>
      )}

      {/* Matrix View */}
      {activeView === 'matrix' && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-[600px]">
        {/* Left Panel - Enhanced Profiles List */}
        <Card className="xl:col-span-1 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Perfis de Acesso</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                {filteredProfiles.length}
              </Badge>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar perfis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {filteredProfiles.map(profile => {
                const isSelected = selectedProfileId === profile.id;
                
                return (
                  <div
                    key={profile.id}
                    className={`p-4 border-b cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                      isSelected 
                        ? 'bg-primary/10 border-primary/20 shadow-sm' 
                        : 'hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedProfileId(profile.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-medium shadow-sm transition-transform hover:scale-105"
                        style={{ backgroundColor: profile.color }}
                      >
                        {profile.display_name.charAt(0)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">
                            {profile.display_name}
                          </span>
                          <Badge 
                            variant={profile.level >= 80 ? "default" : profile.level >= 50 ? "secondary" : "outline"} 
                            className="text-xs"
                          >
                            {profile.level}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground truncate">
                          {profile.description}
                        </p>
                        
                        <div className="flex items-center gap-1 mt-2">
                          {profile.is_system && (
                            <Badge variant="secondary" className="text-xs">
                              Sistema
                            </Badge>
                          )}
                          {!profile.active && (
                            <Badge variant="destructive" className="text-xs">
                              Inativo
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  </div>
                );
              })}
              
              {filteredProfiles.length === 0 && (
                <div className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm font-medium">
                    {searchTerm ? 'Nenhum perfil encontrado' : 'Nenhum perfil criado'}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {searchTerm ? 'Tente outros termos de busca' : 'Crie o primeiro perfil de acesso'}
                  </p>
                  {!searchTerm && (
                    <Button 
                      size="sm" 
                      className="mt-3"
                      onClick={() => setShowProfilesManager(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Perfil
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Permission Matrix */}
        <div className="xl:col-span-3">
          <PermissionMatrix selectedProfileId={selectedProfileId} />
        </div>
      </div>
      )}
    </div>
  );
};