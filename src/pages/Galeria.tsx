import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import Footer from "@/components/layout/Footer";

import { Calendar, Users, Heart, Music, Camera, Play } from "lucide-react";

const Galeria = () => {
  const [activeCategory, setActiveCategory] = useState("todos");

  const categories = [
    { id: "todos", name: "Todos", icon: Camera },
    { id: "culto", name: "Cultos", icon: Music },
    { id: "celula", name: "Células", icon: Users },
    { id: "evento", name: "Eventos", icon: Calendar },
    { id: "geral", name: "Geral", icon: Heart },
    { id: "jovens", name: "Jovens", icon: Users }
  ];

  const mediaItems = [
    {
      id: 1,
      tipo: "foto",
      categoria: "culto",
      titulo: "Culto Dominical - Janeiro 2024",
      descricao: "Momento especial de adoração e comunhão",
      data: "21/01/2024",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 2,
      tipo: "foto",
      categoria: "celula",
      titulo: "Célula Vida Nova",
      descricao: "Reunião semanal da célula no Bairro Renascença",
      data: "18/01/2024",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 3,
      tipo: "video",
      categoria: "evento",
      titulo: "Conferência de Células 2023",
      descricao: "Highlights do nosso grande evento anual",
      data: "15/03/2023",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 4,
      tipo: "foto",
      categoria: "geral",
      titulo: "Almoço Comunitário",
      descricao: "Confraternização após o culto dominical",
      data: "14/01/2024",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 5,
      tipo: "foto",
      categoria: "jovens",
      titulo: "Culto de Jovens",
      descricao: "Energia e adoração no culto da juventude",
      data: "12/01/2024",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 6,
      tipo: "foto",
      categoria: "celula",
      titulo: "Célula Esperança",
      descricao: "Momento de oração e estudo bíblico",
      data: "11/01/2024",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 7,
      tipo: "video",
      categoria: "culto",
      titulo: "Pregação: O Poder da Oração",
      descricao: "Mensagem transformadora sobre oração",
      data: "07/01/2024",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 8,
      tipo: "foto",
      categoria: "batismo",
      titulo: "Batismo - Dezembro 2023",
      descricao: "Celebração de novas vidas em Cristo",
      data: "17/12/2023",
      thumbnail: "/placeholder.svg"
    },
    {
      id: 9,
      tipo: "foto",
      categoria: "geral",
      titulo: "Retiro de Líderes",
      descricao: "Capacitação e comunhão entre líderes",
      data: "02/12/2023",
      thumbnail: "/placeholder.svg"
    }
  ];

  const filteredItems = activeCategory === "todos" 
    ? mediaItems 
    : mediaItems.filter(item => item.categoria === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-playfair font-bold mb-6">
            Nossa Galeria
          </h1>
          <p className="text-xl opacity-90">
            Reviva os momentos especiais da nossa comunidade
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-accent/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  onClick={() => setActiveCategory(category.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.tipo === "video" && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-primary ml-1" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="bg-primary px-2 py-1 rounded-full text-xs text-white font-medium">
                      {item.tipo === "video" ? "Vídeo" : "Foto"}
                    </span>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-playfair font-semibold mb-2 line-clamp-2">{item.titulo}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.descricao}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{item.data}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma mídia encontrada nesta categoria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-gradient-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-playfair font-bold mb-6">
            Faça Parte da Nossa História
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Venha participar dos nossos encontros e seja parte dos próximos momentos especiais
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-3">
              <Users className="mr-2 w-5 h-5" />
              Encontrar uma Célula
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary px-8 py-3">
              <Calendar className="mr-2 w-5 h-5" />
              Ver Agenda
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Galeria;