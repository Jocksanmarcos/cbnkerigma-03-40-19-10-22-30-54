import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ConfigModal } from './ConfigModal';

interface DashboardModule {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface DashboardNavigationProps {
  modules: DashboardModule[];
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
}

export const DashboardNavigation = ({ 
  modules, 
  activeModule, 
  onModuleChange 
}: DashboardNavigationProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    navigate('/auth');
  };

  return (
    <div className="w-80 bg-card border-r border-border/50 shadow-sm min-h-screen flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">Kerigma EAD</h2>
            <p className="text-sm text-muted-foreground">Gestão Eclesiástica</p>
          </div>
        </div>
        
        <Separator className="mb-6" />
        
        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              
              return (
                <Button
                  key={module.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12 text-left font-medium",
                    isActive && "bg-primary text-primary-foreground shadow-sm",
                    !isActive && "hover:bg-muted/50"
                  )}
                  onClick={() => onModuleChange(module.id)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {module.label}
                </Button>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto pt-6 space-y-2">
          <Separator className="mb-4" />
          <div className="text-sm text-muted-foreground mb-3 truncate">
            {user?.email}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setConfigModalOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Config
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <ConfigModal 
        open={configModalOpen} 
        onOpenChange={setConfigModalOpen} 
      />
    </div>
  );
};