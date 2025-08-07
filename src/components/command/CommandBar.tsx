import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { 
  Search,
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  Building2,
  GraduationCap,
  BarChart3,
  Camera,
  Shield,
  Plus,
  User,
  CalendarPlus,
  HandCoins
} from 'lucide-react';

export function CommandBar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const navigationCommands = [
    {
      icon: BarChart3,
      label: 'Visão Geral',
      action: () => navigate('/dashboard'),
      keywords: ['dashboard', 'visao', 'geral', 'inicio']
    },
    {
      icon: Users,
      label: 'Pessoas',
      action: () => navigate('/dashboard'),
      keywords: ['pessoas', 'membros', 'usuarios']
    },
    {
      icon: UserCheck,
      label: 'Células',
      action: () => navigate('/dashboard'),
      keywords: ['celulas', 'grupos', 'pequenos']
    },
    {
      icon: GraduationCap,
      label: 'Ensino',
      action: () => navigate('/admin/ensino'),
      keywords: ['ensino', 'cursos', 'educacao', 'trilhas']
    },
    {
      icon: Calendar,
      label: 'Agenda',
      action: () => navigate('/agenda'),
      keywords: ['agenda', 'eventos', 'calendario']
    },
    {
      icon: DollarSign,
      label: 'Financeiro',
      action: () => navigate('/dashboard'),
      keywords: ['financeiro', 'dizimos', 'ofertas', 'dinheiro']
    },
    {
      icon: Building2,
      label: 'Patrimônio',
      action: () => navigate('/dashboard'),
      keywords: ['patrimonio', 'bens', 'equipamentos']
    },
    {
      icon: Shield,
      label: 'Segurança',
      action: () => navigate('/dashboard'),
      keywords: ['seguranca', 'usuarios', 'permissoes']
    },
    {
      icon: Camera,
      label: 'Mídias',
      action: () => navigate('/galeria'),
      keywords: ['midias', 'fotos', 'galeria', 'imagens']
    }
  ];

  const quickActions = [
    {
      icon: Plus,
      label: 'Adicionar Novo Membro',
      action: () => navigate('/dashboard'),
      keywords: ['adicionar', 'novo', 'membro', 'pessoa', 'cadastrar']
    },
    {
      icon: UserCheck,
      label: 'Nova Célula',
      action: () => navigate('/dashboard'),
      keywords: ['nova', 'celula', 'grupo', 'criar']
    },
    {
      icon: CalendarPlus,
      label: 'Novo Evento',
      action: () => navigate('/agenda'),
      keywords: ['novo', 'evento', 'agendar', 'criar']
    },
    {
      icon: HandCoins,
      label: 'Registrar Contribuição',
      action: () => navigate('/dashboard'),
      keywords: ['contribuicao', 'dizimo', 'oferta', 'registrar']
    }
  ];

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Digite um comando ou procure algo..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          
          <CommandGroup heading="Navegação">
            {navigationCommands.map((command) => (
              <CommandItem
                key={command.label}
                value={command.keywords.join(' ')}
                onSelect={() => runCommand(command.action)}
                className="flex items-center gap-2"
              >
                <command.icon className="h-4 w-4" />
                <span>{command.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Ações Rápidas">
            {quickActions.map((action) => (
              <CommandItem
                key={action.label}
                value={action.keywords.join(' ')}
                onSelect={() => runCommand(action.action)}
                className="flex items-center gap-2"
              >
                <action.icon className="h-4 w-4" />
                <span>{action.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}