import { useState } from "react";
import {
  BarChart3,
  Users,
  UserCheck,
  GraduationCap,
  Calendar,
  DollarSign,
  Building2,
  Shield,
  Camera,
  ChevronDown
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MenuItem {
  title: string;
  value: string;
  icon: any;
  onClick: () => void;
  keywords: string[];
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
  defaultOpen?: boolean;
}

interface SidebarModuleGroupsProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isSedeAdmin: boolean;
  searchTerm: string;
  isCollapsed: boolean;
}

export function SidebarModuleGroups({ 
  activeModule, 
  onModuleChange, 
  isSedeAdmin, 
  searchTerm,
  isCollapsed 
}: SidebarModuleGroupsProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'visao-geral': true,
    'gestao-pessoas': true,
    'ministerios': false,
    'administracao': false,
    'seguranca': false,
    'midias': false
  });

  const toggleGroup = (groupKey: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const menuGroups: MenuGroup[] = [
    {
      title: "Visão Geral",
      defaultOpen: true,
      items: [
        { 
          title: "Dashboard", 
          value: "visao-geral", 
          icon: BarChart3, 
          onClick: () => onModuleChange("visao-geral"),
          keywords: ['dashboard', 'visao', 'geral', 'inicio', 'painel']
        },
      ]
    },
    {
      title: "Gestão de Pessoas",
      defaultOpen: true,
      items: [
        { 
          title: "Pessoas", 
          value: "pessoas", 
          icon: Users, 
          onClick: () => onModuleChange("pessoas"),
          keywords: ['pessoas', 'membros', 'usuarios', 'congregacao']
        },
        { 
          title: "Células", 
          value: "celulas", 
          icon: UserCheck, 
          onClick: () => onModuleChange("celulas"),
          keywords: ['celulas', 'grupos', 'pequenos', 'comunidade']
        },
      ]
    },
    {
      title: "Ministérios",
      items: [
        { 
          title: "Ensino", 
          value: "ensino", 
          icon: GraduationCap, 
          onClick: () => onModuleChange("ensino"),
          keywords: ['ensino', 'cursos', 'educacao', 'trilhas', 'aprendizado']
        },
        { 
          title: "Agenda", 
          value: "agenda", 
          icon: Calendar, 
          onClick: () => onModuleChange("agenda"),
          keywords: ['agenda', 'eventos', 'calendario', 'programacao']
        },
      ]
    },
    {
      title: "Administração",
      items: [
        { 
          title: "Financeiro", 
          value: "financeiro", 
          icon: DollarSign, 
          onClick: () => onModuleChange("financeiro"),
          keywords: ['financeiro', 'dizimos', 'ofertas', 'dinheiro', 'contribuicoes']
        },
        { 
          title: "Patrimônio", 
          value: "patrimonio", 
          icon: Building2, 
          onClick: () => onModuleChange("patrimonio"),
          keywords: ['patrimonio', 'bens', 'equipamentos', 'inventario']
        },
        ...(isSedeAdmin ? [{ 
          title: "Missões", 
          value: "missoes", 
          icon: Building2, 
          onClick: () => onModuleChange("missoes"),
          keywords: ['missoes', 'igrejas', 'expansao', 'plantacao']
        }] : []),
      ]
    },
    {
      title: "Segurança",
      items: [
        { 
          title: "Módulo de Segurança", 
          value: "seguranca", 
          icon: Shield, 
          onClick: () => onModuleChange("seguranca"),
          keywords: ['seguranca', 'usuarios', 'permissoes', 'acesso']
        },
      ]
    },
    {
      title: "Mídias",
      items: [
        { 
          title: "Mídias", 
          value: "midias", 
          icon: Camera, 
          onClick: () => onModuleChange("midias"),
          keywords: ['midias', 'fotos', 'galeria', 'imagens', 'videos']
        },
      ]
    }
  ];

  const filterItems = (items: MenuItem[]) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      ) || item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const isActive = (value: string) => activeModule === value;

  return (
    <>
      {menuGroups.map((group) => {
        const groupKey = group.title.toLowerCase().replace(/\s+/g, '-').replace('ã', 'a').replace('ç', 'c');
        const filteredItems = filterItems(group.items);
        const isGroupOpen = openGroups[groupKey] ?? group.defaultOpen ?? false;
        
        if (filteredItems.length === 0) return null;

        return (
          <SidebarGroup key={group.title}>
            {!isCollapsed ? (
              <Collapsible
                open={isGroupOpen}
                onOpenChange={() => toggleGroup(groupKey)}
              >
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="group/label flex items-center justify-between w-full px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <span>{group.title}</span>
                    <ChevronDown className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      isGroupOpen && "rotate-180"
                    )} />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {filteredItems.map((item) => (
                        <SidebarMenuItem key={item.value}>
                          <SidebarMenuButton
                            onClick={item.onClick}
                            className={cn(
                              "w-full justify-start transition-all duration-200 hover:bg-primary/10 hover:text-primary",
                              isActive(item.value) && "bg-primary/15 text-primary border-r-2 border-primary"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              // Modo colapsado - apenas ícones
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredItems.map((item) => (
                    <SidebarMenuItem key={item.value}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            onClick={item.onClick}
                            className={cn(
                              "w-full justify-center transition-all duration-200 hover:bg-primary/10 hover:text-primary",
                              isActive(item.value) && "bg-primary/15 text-primary border-r-2 border-primary"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="ml-2">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        );
      })}
    </>
  );
}