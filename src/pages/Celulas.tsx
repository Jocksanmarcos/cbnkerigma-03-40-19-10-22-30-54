import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Footer from "@/components/layout/Footer";


import { MapPin, Calendar, Users, Phone, Clock, Search, Download, FileText, BookOpen, Filter, Grid, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { useCelulas } from "@/hooks/useCelulas";
import { useEstudos } from "@/hooks/useEstudos";

const Celulas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" ou "list"
  const [filterBairro, setFilterBairro] = useState("");
  const { toast } = useToast();
  const { celulas, isLoading: celulaLoading } = useCelulas();
  const { estudos, baixarEstudo, isLoading: estudosLoading } = useEstudos();


  const filteredCelulas = celulas.filter(celula => {
    const matchesSearch = celula.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      celula.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      celula.bairro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      celula.lider.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBairro = filterBairro === "" || celula.bairro.toLowerCase().includes(filterBairro.toLowerCase());
    
    return matchesSearch && matchesBairro;
  });

  // Obter lista única de bairros para o filtro
  const bairrosUnicos = [...new Set(celulas.map(celula => celula.bairro))].sort();

  const handleContact = (celula: any) => {
    toast({
      title: "Contato iniciado!",
      description: `Em breve você receberá informações sobre a ${celula.nome}.`,
    });
  };


  return (
    <div className="min-h-screen bg-background">
      
      
      {/* O que são Células */}
      <section className="section-padding bg-accent/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-playfair font-bold mb-6">
            O que são Células?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            As células são pequenos grupos que se reúnem nas casas para estudar a Bíblia, 
            orar, ter comunhão e alcançar novos amigos para Jesus. É onde relacionamentos 
            profundos são formados e vidas são transformadas.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-playfair font-semibold mb-2">Comunhão</h3>
              <p className="text-muted-foreground text-base">
                Relacionamentos genuínos e duradouros
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-playfair font-semibold mb-2">Crescimento</h3>
              <p className="text-muted-foreground text-base">
                Estudo da Palavra e crescimento espiritual
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-playfair font-semibold mb-2">Evangelismo</h3>
              <p className="text-muted-foreground text-base">
                Alcançando novos amigos para Jesus
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nossas Células */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-playfair font-bold text-center mb-8">
            Nossas Células
          </h2>
          
          {/* Filtros e Controles */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Buscar por nome, líder, bairro ou endereço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filtro por Bairro */}
              <div className="relative min-w-48">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <select
                  value={filterBairro}
                  onChange={(e) => setFilterBairro(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Todos os bairros</option>
                  {bairrosUnicos.map(bairro => (
                    <option key={bairro} value={bairro}>{bairro}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Controles de Visualização */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{celulas.length}</div>
              <div className="text-sm text-muted-foreground">Total de Células</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{bairrosUnicos.length}</div>
              <div className="text-sm text-muted-foreground">Bairros Atendidos</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {celulas.reduce((sum, celula) => sum + (celula.membros_atual || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total de Membros</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{filteredCelulas.length}</div>
              <div className="text-sm text-muted-foreground">Resultados da Busca</div>
            </Card>
          </div>
          
          {celulaLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Carregando células...</p>
            </div>
          ) : (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                : "space-y-4"
            }>
              {filteredCelulas.map((celula) => (
                <Card 
                  key={celula.id} 
                  className={`hover:shadow-lg transition-all duration-300 ${
                    viewMode === "list" ? "flex items-center p-4" : ""
                  }`}
                >
                  <CardContent className={viewMode === "list" ? "flex items-center w-full p-0" : "p-5"}>
                    {viewMode === "grid" ? (
                      // Visualização em Grid (layout original)
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-playfair font-semibold text-foreground">{celula.nome}</h3>
                          <div className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                            <Users className="w-3 h-3 mr-1" />
                            {celula.membros_atual}
                          </div>
                        </div>
                        
                        {celula.descricao && (
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{celula.descricao}</p>
                        )}
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm">
                            <Users className="w-3 h-3 text-primary mr-2 flex-shrink-0" />
                            <span className="text-foreground font-medium">{celula.lider}</span>
                          </div>
                          
                          <div className="flex items-start text-sm">
                            <MapPin className="w-3 h-3 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-foreground truncate">{celula.endereco}</div>
                              <div className="text-muted-foreground text-xs">{celula.bairro}</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center text-sm">
                              <Calendar className="w-3 h-3 text-primary mr-2 flex-shrink-0" />
                              <span className="text-foreground text-xs">{celula.dia_semana}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="w-3 h-3 text-primary mr-2 flex-shrink-0" />
                              <span className="text-foreground text-xs">{celula.horario}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => handleContact(celula)}
                          className="w-full"
                          size="sm"
                        >
                          <Phone className="w-3 h-3 mr-2" />
                          Entrar em Contato
                        </Button>
                      </>
                    ) : (
                      // Visualização em Lista
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Users className="w-6 h-6 text-primary" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">{celula.nome}</h3>
                                <p className="text-sm text-muted-foreground">Líder: {celula.lider}</p>
                              </div>
                              <div className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium ml-2">
                                <Users className="w-3 h-3 mr-1" />
                                {celula.membros_atual}
                              </div>
                            </div>
                            
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 text-primary mr-1" />
                                <span className="text-muted-foreground truncate">{celula.bairro}</span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 text-primary mr-1" />
                                <span className="text-muted-foreground">{celula.dia_semana}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 text-primary mr-1" />
                                <span className="text-muted-foreground">{celula.horario}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 ml-4">
                          <Button 
                            onClick={() => handleContact(celula)}
                            size="sm"
                          >
                            <Phone className="w-3 h-3 mr-2" />
                            Contato
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {filteredCelulas.length === 0 && !celulaLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg mb-2">Nenhuma célula encontrada</p>
              <p className="text-muted-foreground text-sm">
                Tente ajustar os filtros de busca ou entre em contato para mais informações.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Estudos da Semana */}
      <section className="section-padding bg-neutral/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-playfair font-bold mb-4">
              Estudos da Semana
            </h2>
            <p className="text-lg text-muted-foreground">
              Baixe os estudos bíblicos semanais para usar em sua célula
            </p>
          </div>
          
          {estudosLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Carregando estudos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {estudos.map((estudo) => {
                const semanaTexto = `Semana de ${new Date(estudo.semana_inicio).toLocaleDateString('pt-BR')} a ${new Date(estudo.semana_fim).toLocaleDateString('pt-BR')}`;
                
                return (
                  <Card key={estudo.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-playfair font-semibold mb-2">{estudo.titulo}</h3>
                          <p className="text-base text-primary font-medium mb-1">{semanaTexto}</p>
                          <p className="text-base text-muted-foreground mb-3">{estudo.descricao}</p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center ml-4">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-base text-muted-foreground">
                          <FileText className="w-4 h-4 mr-1" />
                          <span className="mr-4">{estudo.versiculo_chave}</span>
                          <span>{estudo.arquivo_tamanho}</span>
                        </div>
                        
                        <Button 
                          onClick={() => baixarEstudo(estudo)}
                          variant="outline"
                          size="sm"
                          className="ml-4"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar ({estudo.downloads})
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          <div className="text-center mt-8">
            <p className="text-base text-muted-foreground">
              Os estudos são atualizados semanalmente. Para mais materiais, entre em contato com sua liderança.
            </p>
          </div>
        </div>
      </section>

      {/* Recursos Adicionais */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-playfair font-bold mb-6">
            Recursos Adicionais
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Acesse nossa central de recursos com materiais complementares, 
            treinamentos e ferramentas para enriquecer sua experiência em célula.
          </p>
          
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 border border-primary/20">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-playfair font-semibold mb-4">DNA Central - Recursos</h3>
            <p className="text-muted-foreground mb-6">
              Materiais de apoio, dinâmicas, estudos complementares e muito mais 
              para fortalecer sua célula e crescer em comunidade.
            </p>
            <Button 
              asChild
              size="lg"
              className="gap-2"
            >
              <a 
                href="https://linktr.ee/dnacentralrecursos" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <FileText className="w-4 h-4" />
                Acessar Recursos
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Celulas;