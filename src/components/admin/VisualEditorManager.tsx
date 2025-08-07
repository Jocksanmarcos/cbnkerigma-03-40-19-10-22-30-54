import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Edit, 
  Save, 
  Undo, 
  Redo,
  Type,
  Image,
  Layout,
  Palette,
  MousePointer,
  Smartphone,
  Tablet,
  Monitor,
  Code,
  Download,
  Upload,
  Layers,
  Move,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Element {
  id: string;
  type: 'text' | 'image' | 'button' | 'card' | 'section';
  content: string;
  styles: {
    position: { x: number; y: number };
    size: { width: number; height: number };
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    fontWeight: string;
    padding: number;
    margin: number;
    borderRadius: number;
    border: string;
  };
  parentId?: string;
}

interface Page {
  id: string;
  name: string;
  elements: Element[];
  styles: {
    backgroundColor: string;
    backgroundImage?: string;
    minHeight: string;
  };
}

const defaultElement: Omit<Element, 'id' | 'content'> = {
  type: 'text',
  styles: {
    position: { x: 50, y: 50 },
    size: { width: 200, height: 40 },
    backgroundColor: 'transparent',
    textColor: '#000000',
    fontSize: 16,
    fontWeight: 'normal',
    padding: 8,
    margin: 0,
    borderRadius: 4,
    border: 'none'
  }
};

const elementTypes = [
  { type: 'text', label: 'Texto', icon: Type },
  { type: 'image', label: 'Imagem', icon: Image },
  { type: 'button', label: 'Botão', icon: MousePointer },
  { type: 'card', label: 'Card', icon: Layout },
  { type: 'section', label: 'Seção', icon: Layers }
];

const viewportSizes = [
  { name: 'Desktop', icon: Monitor, width: 1200 },
  { name: 'Tablet', icon: Tablet, width: 768 },
  { name: 'Mobile', icon: Smartphone, width: 375 }
];

export const VisualEditorManager = () => {
  const [currentPage, setCurrentPage] = useState<Page>({
    id: '1',
    name: 'Página Principal',
    elements: [
      {
        id: '1',
        type: 'text',
        content: 'Bem-vindo à nossa Igreja',
        styles: {
          ...defaultElement.styles,
          position: { x: 100, y: 50 },
          fontSize: 32,
          fontWeight: 'bold',
          textColor: '#1f2937'
        }
      },
      {
        id: '2',
        type: 'text',
        content: 'Venha fazer parte da nossa comunidade de fé',
        styles: {
          ...defaultElement.styles,
          position: { x: 100, y: 100 },
          fontSize: 18,
          textColor: '#6b7280'
        }
      },
      {
        id: '3',
        type: 'button',
        content: 'Conhecer Células',
        styles: {
          ...defaultElement.styles,
          position: { x: 100, y: 150 },
          backgroundColor: '#3b82f6',
          textColor: '#ffffff',
          padding: 12,
          borderRadius: 8
        }
      }
    ],
    styles: {
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }
  });

  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState('Desktop');
  const [showCode, setShowCode] = useState(false);
  const [history, setHistory] = useState<Page[]>([currentPage]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const addElement = (type: string) => {
    const newElement: Element = {
      id: Date.now().toString(),
      type: type as Element['type'],
      content: getDefaultContent(type),
      styles: { ...defaultElement.styles }
    };

    const updatedPage = {
      ...currentPage,
      elements: [...currentPage.elements, newElement]
    };
    
    updatePageWithHistory(updatedPage);
    setSelectedElement(newElement);
    
    toast({
      title: "Elemento Adicionado!",
      description: `${type} foi adicionado à página`
    });
  };

  const getDefaultContent = (type: string): string => {
    switch (type) {
      case 'text': return 'Novo texto';
      case 'button': return 'Clique aqui';
      case 'image': return 'https://via.placeholder.com/200x150';
      case 'card': return 'Conteúdo do card';
      case 'section': return 'Nova seção';
      default: return 'Conteúdo';
    }
  };

  const updateElement = (elementId: string, updates: Partial<Element>) => {
    const updatedPage = {
      ...currentPage,
      elements: currentPage.elements.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
      )
    };
    
    updatePageWithHistory(updatedPage);
    
    if (selectedElement?.id === elementId) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  const deleteElement = (elementId: string) => {
    const updatedPage = {
      ...currentPage,
      elements: currentPage.elements.filter(el => el.id !== elementId)
    };
    
    updatePageWithHistory(updatedPage);
    setSelectedElement(null);
    
    toast({
      title: "Elemento Removido!",
      description: "O elemento foi removido da página"
    });
  };

  const updatePageWithHistory = (newPage: Page) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPage);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPage(newPage);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPage(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPage(history[historyIndex + 1]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, element: Element) => {
    setSelectedElement(element);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.styles.position.x,
      y: e.clientY - element.styles.position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedElement) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      updateElement(selectedElement.id, {
        styles: {
          ...selectedElement.styles,
          position: { x: Math.max(0, newX), y: Math.max(0, newY) }
        }
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const generateCode = () => {
    let code = `import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const GeneratedPage = () => {
  return (
    <div style={{
      backgroundColor: '${currentPage.styles.backgroundColor}',
      minHeight: '${currentPage.styles.minHeight}',
      position: 'relative'
    }}>
`;

    currentPage.elements.forEach(element => {
      const styles = `
        position: 'absolute',
        left: '${element.styles.position.x}px',
        top: '${element.styles.position.y}px',
        width: '${element.styles.size.width}px',
        height: '${element.styles.size.height}px',
        backgroundColor: '${element.styles.backgroundColor}',
        color: '${element.styles.textColor}',
        fontSize: '${element.styles.fontSize}px',
        fontWeight: '${element.styles.fontWeight}',
        padding: '${element.styles.padding}px',
        margin: '${element.styles.margin}px',
        borderRadius: '${element.styles.borderRadius}px',
        border: '${element.styles.border}'
      `;

      switch (element.type) {
        case 'text':
          code += `      <div style={{${styles}}}>${element.content}</div>\n`;
          break;
        case 'button':
          code += `      <Button style={{${styles}}}>${element.content}</Button>\n`;
          break;
        case 'image':
          code += `      <img src="${element.content}" alt="Image" style={{${styles}}} />\n`;
          break;
        case 'card':
          code += `      <Card style={{${styles}}}><CardContent>${element.content}</CardContent></Card>\n`;
          break;
        case 'section':
          code += `      <section style={{${styles}}}>${element.content}</section>\n`;
          break;
      }
    });

    code += `    </div>
  );
};

export default GeneratedPage;`;

    return code;
  };

  const downloadCode = () => {
    const code = generateCode();
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${currentPage.name.toLowerCase().replace(/\s+/g, '-')}.tsx`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Código Baixado!",
      description: "O arquivo TSX foi baixado com sucesso"
    });
  };

  const currentViewport = viewportSizes.find(v => v.name === viewport) || viewportSizes[0];

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">Editor Visual</h2>
            
            {/* Viewport Selector */}
            <div className="flex items-center space-x-2">
              {viewportSizes.map((size) => {
                const Icon = size.icon;
                return (
                  <Button
                    key={size.name}
                    variant={viewport === size.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewport(size.name)}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex === 0}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex === history.length - 1}>
              <Redo className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowCode(!showCode)}>
              <Code className="w-4 h-4 mr-2" />
              {showCode ? 'Editor' : 'Código'}
            </Button>
            <Button size="sm" onClick={downloadCode}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Elements */}
        <div className="w-64 border-r bg-background p-4 overflow-y-auto desktop-scrollbar">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Elementos</h3>
              <div className="space-y-2">
                {elementTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.type}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => addElement(type.type)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {type.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Página</h3>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="pageName">Nome</Label>
                  <Input
                    id="pageName"
                    value={currentPage.name}
                    onChange={(e) => setCurrentPage(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={currentPage.styles.backgroundColor}
                    onChange={(e) => setCurrentPage(prev => ({
                      ...prev,
                      styles: { ...prev.styles, backgroundColor: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 bg-gray-100 overflow-auto">
          {showCode ? (
            <div className="p-4 h-full">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-auto h-full">
                <code>{generateCode()}</code>
              </pre>
            </div>
          ) : (
            <div className="flex justify-center p-8">
              <div
                ref={canvasRef}
                className="bg-white shadow-lg rounded-lg overflow-hidden"
                style={{ 
                  width: currentViewport.width, 
                  minHeight: '600px',
                  position: 'relative'
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <div
                  style={{
                    backgroundColor: currentPage.styles.backgroundColor,
                    minHeight: currentPage.styles.minHeight,
                    position: 'relative'
                  }}
                >
                  {currentPage.elements.map((element) => (
                    <div
                      key={element.id}
                      className={`absolute cursor-move ${
                        selectedElement?.id === element.id ? 'ring-2 ring-primary' : ''
                      }`}
                      style={{
                        left: element.styles.position.x,
                        top: element.styles.position.y,
                        width: element.styles.size.width,
                        height: element.styles.size.height,
                        backgroundColor: element.styles.backgroundColor,
                        color: element.styles.textColor,
                        fontSize: element.styles.fontSize,
                        fontWeight: element.styles.fontWeight,
                        padding: element.styles.padding,
                        margin: element.styles.margin,
                        borderRadius: element.styles.borderRadius,
                        border: element.styles.border
                      }}
                      onMouseDown={(e) => handleMouseDown(e, element)}
                      onClick={() => setSelectedElement(element)}
                    >
                      {element.type === 'image' ? (
                        <img 
                          src={element.content} 
                          alt="Element" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        element.content
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l bg-background p-4 overflow-y-auto desktop-scrollbar">
          {selectedElement ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Propriedades</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteElement(selectedElement.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Conteúdo</TabsTrigger>
                  <TabsTrigger value="style">Estilo</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  <div>
                    <Label htmlFor="content">Conteúdo</Label>
                    {selectedElement.type === 'text' || selectedElement.type === 'button' ? (
                      <Input
                        id="content"
                        value={selectedElement.content}
                        onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                      />
                    ) : selectedElement.type === 'image' ? (
                      <Input
                        id="content"
                        placeholder="URL da imagem"
                        value={selectedElement.content}
                        onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                      />
                    ) : (
                      <Textarea
                        id="content"
                        value={selectedElement.content}
                        onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="style" className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="backgroundColor">Fundo</Label>
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={selectedElement.styles.backgroundColor}
                        onChange={(e) => updateElement(selectedElement.id, {
                          styles: { ...selectedElement.styles, backgroundColor: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="textColor">Texto</Label>
                      <Input
                        id="textColor"
                        type="color"
                        value={selectedElement.styles.textColor}
                        onChange={(e) => updateElement(selectedElement.id, {
                          styles: { ...selectedElement.styles, textColor: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Tamanho da Fonte: {selectedElement.styles.fontSize}px</Label>
                    <Slider
                      value={[selectedElement.styles.fontSize]}
                      onValueChange={([value]) => updateElement(selectedElement.id, {
                        styles: { ...selectedElement.styles, fontSize: value }
                      })}
                      max={72}
                      min={8}
                      step={1}
                    />
                  </div>

                  <div>
                    <Label>Border Radius: {selectedElement.styles.borderRadius}px</Label>
                    <Slider
                      value={[selectedElement.styles.borderRadius]}
                      onValueChange={([value]) => updateElement(selectedElement.id, {
                        styles: { ...selectedElement.styles, borderRadius: value }
                      })}
                      max={50}
                      min={0}
                      step={1}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="layout" className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="posX">Posição X</Label>
                      <Input
                        id="posX"
                        type="number"
                        value={selectedElement.styles.position.x}
                        onChange={(e) => updateElement(selectedElement.id, {
                          styles: { 
                            ...selectedElement.styles, 
                            position: { ...selectedElement.styles.position, x: Number(e.target.value) }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="posY">Posição Y</Label>
                      <Input
                        id="posY"
                        type="number"
                        value={selectedElement.styles.position.y}
                        onChange={(e) => updateElement(selectedElement.id, {
                          styles: { 
                            ...selectedElement.styles, 
                            position: { ...selectedElement.styles.position, y: Number(e.target.value) }
                          }
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="width">Largura</Label>
                      <Input
                        id="width"
                        type="number"
                        value={selectedElement.styles.size.width}
                        onChange={(e) => updateElement(selectedElement.id, {
                          styles: { 
                            ...selectedElement.styles, 
                            size: { ...selectedElement.styles.size, width: Number(e.target.value) }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">Altura</Label>
                      <Input
                        id="height"
                        type="number"
                        value={selectedElement.styles.size.height}
                        onChange={(e) => updateElement(selectedElement.id, {
                          styles: { 
                            ...selectedElement.styles, 
                            size: { ...selectedElement.styles.size, height: Number(e.target.value) }
                          }
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Padding: {selectedElement.styles.padding}px</Label>
                    <Slider
                      value={[selectedElement.styles.padding]}
                      onValueChange={([value]) => updateElement(selectedElement.id, {
                        styles: { ...selectedElement.styles, padding: value }
                      })}
                      max={50}
                      min={0}
                      step={1}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-8">
              <MousePointer className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Selecione um elemento</h3>
              <p className="text-muted-foreground">
                Clique em um elemento no canvas para editá-lo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};