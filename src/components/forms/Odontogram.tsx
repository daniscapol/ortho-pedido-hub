import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ProcedureType = {
  id: string;
  name: string;
  color: string;
  category: string;
};

type ToothSelection = {
  tooth: string;
  procedure: string;
};

const procedureTypes: ProcedureType[] = [
  // Coroas/Copings
  { id: "coroa-anatomica", name: "Coroa anatômica", color: "bg-purple-500", category: "Coroas/Copings" },
  { id: "coroa-reduzida", name: "Coroa reduzida", color: "bg-teal-500", category: "Coroas/Copings" },
  { id: "coroa-injecao", name: "Coroa para injeção", color: "bg-yellow-500", category: "Coroas/Copings" },
  { id: "coroa-casca-ovo", name: "Coroa casca de ovo", color: "bg-blue-600", category: "Coroas/Copings" },
  
  // Pônticos
  { id: "pontico-anatomico", name: "Pôntico anatômico", color: "bg-red-600", category: "Pônticos" },
  { id: "pontico-reduzido", name: "Pôntico reduzido", color: "bg-pink-500", category: "Pônticos" },
  { id: "pontico-injecao", name: "Pôntico para injeção", color: "bg-cyan-500", category: "Pônticos" },
  
  // Inlays/Overlays
  { id: "inlay", name: "Inlay", color: "bg-green-600", category: "Inlays/Overlays" },
  { id: "inlay-simples", name: "Inlay simples", color: "bg-blue-400", category: "Inlays/Overlays" },
  { id: "veneer", name: "Veneer", color: "bg-teal-400", category: "Inlays/Overlays" },
  
  // Outros
  { id: "antagonista", name: "Antagonista", color: "bg-orange-500", category: "Outros" },
];

const Odontogram = ({ onToothSelect }: { onToothSelect: (teeth: string[]) => void }) => {
  const [selectedTeeth, setSelectedTeeth] = useState<ToothSelection[]>([]);
  const [activeProcedure, setActiveProcedure] = useState<string>("coroa-anatomica");

  // Numeração padrão dos dentes (sistema FDI)
  const upperTeeth = [
    "18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"
  ];
  
  const lowerTeeth = [
    "48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"
  ];

  const toggleTooth = (tooth: string) => {
    const existingIndex = selectedTeeth.findIndex(t => t.tooth === tooth);
    let newSelection: ToothSelection[];
    
    if (existingIndex >= 0) {
      // Remove if same procedure, or update procedure
      if (selectedTeeth[existingIndex].procedure === activeProcedure) {
        newSelection = selectedTeeth.filter(t => t.tooth !== tooth);
      } else {
        newSelection = [...selectedTeeth];
        newSelection[existingIndex] = { tooth, procedure: activeProcedure };
      }
    } else {
      // Add new selection
      newSelection = [...selectedTeeth, { tooth, procedure: activeProcedure }];
    }
    
    setSelectedTeeth(newSelection);
    onToothSelect(newSelection.map(t => `${t.tooth}:${t.procedure}`));
  };

  const getToothColor = (tooth: string): string => {
    const selection = selectedTeeth.find(t => t.tooth === tooth);
    if (!selection) return "bg-card hover:bg-muted border-border";
    
    const procedure = procedureTypes.find(p => p.id === selection.procedure);
    return procedure ? procedure.color : "bg-primary";
  };

  const getToothTextColor = (tooth: string): string => {
    const selection = selectedTeeth.find(t => t.tooth === tooth);
    return selection ? "text-white" : "text-foreground";
  };

  const ToothElement = ({ number, isUpper }: { number: string; isUpper: boolean }) => {
    const selection = selectedTeeth.find(t => t.tooth === number);
    const colorClass = getToothColor(number);
    const textColorClass = getToothTextColor(number);
    
    return (
      <button
        onClick={() => toggleTooth(number)}
        className={`relative w-12 h-16 text-xs border-2 transition-all duration-200 hover:scale-105 ${colorClass} ${textColorClass} ${
          isUpper ? "rounded-t-full rounded-b-sm" : "rounded-b-full rounded-t-sm"
        }`}
        title={selection ? `${number} - ${procedureTypes.find(p => p.id === selection.procedure)?.name}` : number}
      >
        <span className="font-medium">{number}</span>
        {selection && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border border-gray-300">
            <div className={`w-full h-full rounded-full ${procedureTypes.find(p => p.id === selection.procedure)?.color}`}></div>
          </div>
        )}
      </button>
    );
  };

  const clearSelection = () => {
    setSelectedTeeth([]);
    onToothSelect([]);
  };

  const groupedProcedures = procedureTypes.reduce((acc, procedure) => {
    if (!acc[procedure.category]) {
      acc[procedure.category] = [];
    }
    acc[procedure.category].push(procedure);
    return acc;
  }, {} as Record<string, ProcedureType[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Odontograma - Seleção de Dentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Seleção de Procedimentos */}
          <div className="lg:col-span-1">
            <h3 className="font-medium mb-4">Procedimentos</h3>
            <div className="space-y-4">
              {Object.entries(groupedProcedures).map(([category, procedures]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                  <div className="space-y-1">
                    {procedures.map(procedure => (
                      <button
                        key={procedure.id}
                        onClick={() => setActiveProcedure(procedure.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          activeProcedure === procedure.id 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${procedure.color}`}></div>
                          {procedure.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Odontograma Visual */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Procedimento Ativo */}
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <div className={`w-4 h-4 rounded-full ${procedureTypes.find(p => p.id === activeProcedure)?.color}`}></div>
                <span className="text-sm font-medium">
                  Procedimento ativo: {procedureTypes.find(p => p.id === activeProcedure)?.name}
                </span>
              </div>

              {/* Dentes superiores */}
              <div>
                <p className="text-sm text-muted-foreground mb-4">Arcada Superior</p>
                <div className="flex justify-center">
                  <div className="flex gap-1">
                    {upperTeeth.slice(0, 8).reverse().map(tooth => (
                      <ToothElement key={tooth} number={tooth} isUpper={true} />
                    ))}
                  </div>
                  <div className="w-8"></div>
                  <div className="flex gap-1">
                    {upperTeeth.slice(8).map(tooth => (
                      <ToothElement key={tooth} number={tooth} isUpper={true} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Linha divisória */}
              <div className="border-t border-border"></div>

              {/* Dentes inferiores */}
              <div>
                <p className="text-sm text-muted-foreground mb-4">Arcada Inferior</p>
                <div className="flex justify-center">
                  <div className="flex gap-1">
                    {lowerTeeth.slice(0, 8).reverse().map(tooth => (
                      <ToothElement key={tooth} number={tooth} isUpper={false} />
                    ))}
                  </div>
                  <div className="w-8"></div>
                  <div className="flex gap-1">
                    {lowerTeeth.slice(8).map(tooth => (
                      <ToothElement key={tooth} number={tooth} isUpper={false} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Legenda e Seleções */}
              {selectedTeeth.length > 0 && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Dentes Selecionados ({selectedTeeth.length})</h4>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Limpar Tudo
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedTeeth.map(selection => {
                      const procedure = procedureTypes.find(p => p.id === selection.procedure);
                      return (
                        <div key={`${selection.tooth}-${selection.procedure}`} className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono">
                            {selection.tooth}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${procedure?.color}`}></div>
                            <span className="text-sm">{procedure?.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Odontogram;