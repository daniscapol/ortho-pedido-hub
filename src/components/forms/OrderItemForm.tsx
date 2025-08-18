import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Edit } from "lucide-react";
import Odontogram from "./Odontogram";
import OdontogramSVGPro from "./OdontogramSVGPro";
import type { CreateOrderItem } from "@/hooks/useOrderItems";
import { 
  useActiveProducts, 
  useCompatibleTiposProtese, 
  useCompatibleMaterials, 
  useCompatibleColors,
  useTiposProtese,
  useMateriais,
  useCores
} from "@/hooks/useProducts";

interface OrderItemFormProps {
  onAddItem: (item: Omit<CreateOrderItem, 'order_id'>) => void;
  onRemoveItem?: (index: number) => void;
  onEditItem?: (index: number, item: Omit<CreateOrderItem, 'order_id'>) => void;
  items: Array<Omit<CreateOrderItem, 'order_id'>>;
  showOdontogram?: boolean;
}

const OrderItemForm = ({ onAddItem, onRemoveItem, onEditItem, items, showOdontogram = true }: OrderItemFormProps) => {
  const formRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const { data: products = [] } = useActiveProducts();
  
  const [currentItem, setCurrentItem] = useState<Omit<CreateOrderItem, 'order_id'>>({
    product_name: "",
    prosthesis_type: "",
    material: "",
    color: "",
    selected_teeth: [],
    quantity: 1,
    observations: ""
  });

  const [showItemForm, setShowItemForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Get dynamic data based on selected product
  const { data: compatibleTipos = [] } = useCompatibleTiposProtese(selectedProductId || 0);
  const { data: compatibleMaterials = [] } = useCompatibleMaterials(selectedProductId || 0);
  const { data: compatibleColors = [] } = useCompatibleColors(selectedProductId || 0);

  const handleAddItem = () => {
    if (!currentItem.product_name || !currentItem.prosthesis_type || currentItem.selected_teeth.length === 0) {
      return;
    }

    if (editingIndex !== null) {
      // Está editando um item existente
      onEditItem?.(editingIndex, currentItem);
      setEditingIndex(null);
    } else {
      // Está adicionando um novo item
      onAddItem(currentItem);
      
      // Scroll para o topo para visualizar o produto adicionado
      setTimeout(() => {
        topRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }

    // Resetar formulário
    setCurrentItem({
      product_name: "",
      prosthesis_type: "",
      material: "",
      color: "",
      selected_teeth: [],
      quantity: 1,
      observations: ""
    });
    setShowItemForm(false);
  };

  const handleEditItem = (index: number) => {
    const item = items[index];
    setCurrentItem(item);
    setEditingIndex(index);
    setShowItemForm(true);
    
    // Scroll para o formulário de edição
    setTimeout(() => {
      formRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }, 100);
  };

  const handleCancelEdit = () => {
    setCurrentItem({
      product_name: "",
      prosthesis_type: "",
      material: "",
      color: "",
      selected_teeth: [],
      quantity: 1,
      observations: ""
    });
    setEditingIndex(null);
    setShowItemForm(false);
    setSelectedProduct("");
    setSelectedProductId(null);
  };

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    const productIdNum = Number(productId);
    setSelectedProductId(productIdNum);
    const product = products.find(p => p.id === productIdNum);
    if (product) {
      setCurrentItem(prev => ({
        ...prev,
        product_name: product.nome_produto,
        prosthesis_type: "",
        material: "",
        color: "",
      }));
    }
  };

  // Agrupar produtos por categoria
  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.categoria]) {
      acc[product.categoria] = [];
    }
    acc[product.categoria].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  const selectedProductData = products.find(p => p.id === Number(selectedProduct));

  return (
    <div className="space-y-6" ref={topRef}>
      {/* Lista de itens adicionados */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Produtos do Pedido ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex-1">
                       <h4 className="font-medium">{item.product_name}</h4>
                       <p className="text-sm text-muted-foreground">
                         {item.prosthesis_type}
                       </p>
                     </div>
                    <div className="flex gap-2">
                      {onEditItem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(index)}
                          className="text-primary hover:text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onRemoveItem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mb-2">
                    {item.material && (
                      <div>
                        <span className="text-muted-foreground">Material:</span> {item.material}
                      </div>
                    )}
                    {item.color && (
                      <div>
                        <span className="text-muted-foreground">Cor:</span> {item.color}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-xs text-muted-foreground mr-2">Dentes:</span>
                    {item.selected_teeth.map((tooth) => (
                      <Badge key={tooth} variant="secondary" className="text-xs">
                        {tooth}
                      </Badge>
                    ))}
                  </div>

                  {item.observations && (
                    <p className="text-sm text-muted-foreground mt-2">{item.observations}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão para adicionar novo produto (só mostra se não está editando) */}
      {!showItemForm && editingIndex === null && (
        <div className="text-center">
          <Button 
            onClick={() => setShowItemForm(true)} 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Produto/Prótese
          </Button>
        </div>
      )}

      {/* Formulário de novo item */}
      {showItemForm && (
        <Card ref={formRef}>
          <CardHeader>
            <CardTitle>{editingIndex !== null ? "Editar Produto/Prótese" : "Novo Produto/Prótese"}</CardTitle>
          </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="product_select">Selecionar Produto</Label>
                 <Select value={selectedProduct} onValueChange={handleProductChange}>
                   <SelectTrigger>
                     <SelectValue placeholder="Selecione um produto do catálogo" />
                   </SelectTrigger>
                   <SelectContent>
                     {Object.entries(groupedProducts).map(([categoria, categoryProducts]) => (
                       <div key={categoria}>
                         <div className="font-semibold text-sm text-muted-foreground px-2 py-1">
                           {categoria}
                         </div>
                          {categoryProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              <div className="flex flex-col">
                                <span>{product.nome_produto}</span>
                              </div>
                            </SelectItem>
                          ))}
                       </div>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

                {selectedProductData && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="product_name">Nome do Produto</Label>
                      <Input
                        id="product_name"
                        value={currentItem.product_name}
                        disabled
                        className="bg-muted"
                        placeholder="Selecione um produto acima"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prosthesis_type">Tipo de Prótese</Label>
                        <Select 
                          value={currentItem.prosthesis_type} 
                          onValueChange={(value) => setCurrentItem(prev => ({ ...prev, prosthesis_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de prótese" />
                          </SelectTrigger>
                          <SelectContent>
                            {compatibleTipos.map((tipo) => (
                              <SelectItem key={tipo.id} value={tipo.nome_tipo}>
                                {tipo.nome_tipo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="material">Material</Label>
                        <Select 
                          value={currentItem.material} 
                          onValueChange={(value) => setCurrentItem(prev => ({ ...prev, material: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o material" />
                          </SelectTrigger>
                          <SelectContent>
                            {compatibleMaterials.map((material) => (
                              <SelectItem key={material.id} value={material.nome_material}>
                                {material.nome_material}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {compatibleColors.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="color">Cor/Tonalidade</Label>
                        <Select 
                          value={currentItem.color} 
                          onValueChange={(value) => setCurrentItem(prev => ({ ...prev, color: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a cor" />
                          </SelectTrigger>
                          <SelectContent>
                            {compatibleColors.map((cor) => (
                              <SelectItem key={cor.id} value={cor.codigo_cor}>
                                {cor.codigo_cor} - {cor.nome_cor}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
             </div>

            {showOdontogram && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Selecionar Dentes</Label>
                  
                  {/* Botões no topo */}
                  <Odontogram 
                    onToothSelect={(teeth) => setCurrentItem(prev => ({ ...prev, selected_teeth: teeth }))}
                    selectedTeeth={currentItem.selected_teeth}
                  />
                  
                  {/* Profissional embaixo */}
                  <OdontogramSVGPro 
                    onToothSelect={(teeth) => setCurrentItem(prev => ({ ...prev, selected_teeth: teeth }))}
                    selectedTeeth={currentItem.selected_teeth}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={currentItem.observations}
                onChange={(e) => setCurrentItem(prev => ({ ...prev, observations: e.target.value }))}
                placeholder="Observações específicas deste produto"
                rows={3}
              />
            </div>

             <div className="flex gap-2">
               <Button 
                  onClick={handleAddItem}
                   disabled={
                     !selectedProduct || 
                     !currentItem.product_name || 
                     !currentItem.prosthesis_type ||
                     currentItem.selected_teeth.length === 0
                   }
               >
                 {editingIndex !== null ? "Salvar Alterações" : "Adicionar Produto"}
               </Button>
               <Button 
                 variant="outline" 
                 onClick={handleCancelEdit}
               >
                 Cancelar
               </Button>
             </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderItemForm;
