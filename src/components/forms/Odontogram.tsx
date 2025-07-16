import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Representação simplificada do odontograma
const Odontogram = ({ 
  onToothSelect, 
  selectedTeeth: externalSelectedTeeth 
}: { 
  onToothSelect: (teeth: string[]) => void;
  selectedTeeth?: string[];
}) => {
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>(externalSelectedTeeth || []);

  // Numeração padrão dos dentes (sistema FDI)
  const upperTeeth = [
    "18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"
  ];
  
  const lowerTeeth = [
    "48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"
  ];

  const toggleTooth = (tooth: string) => {
    const newSelection = selectedTeeth.includes(tooth)
      ? selectedTeeth.filter(t => t !== tooth)
      : [...selectedTeeth, tooth];
    
    setSelectedTeeth(newSelection);
    onToothSelect(newSelection);
  };

  // Atualizar seleção quando prop externa mudar
  useEffect(() => {
    if (externalSelectedTeeth) {
      setSelectedTeeth(externalSelectedTeeth);
    }
  }, [externalSelectedTeeth]);

  const ToothButton = ({ number }: { number: string }) => {
    const isSelected = selectedTeeth.includes(number);
    return (
      <button
        onClick={() => toggleTooth(number)}
        className={`w-10 h-12 text-xs border border-border rounded transition-colors flex flex-col items-center justify-center gap-0.5 ${
          isSelected 
            ? "bg-primary text-primary-foreground" 
            : "bg-card hover:bg-muted text-foreground"
        }`}
      >
        <div className="text-sm">🦷</div>
        <div>{number}</div>
      </button>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🦷
          Odontograma - Seleção de Dentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Dentes superiores */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Arcada Superior</p>
            <div className="flex justify-center">
              <div className="grid grid-cols-8 gap-1">
                {upperTeeth.slice(0, 8).reverse().map(tooth => (
                  <ToothButton key={tooth} number={tooth} />
                ))}
              </div>
              <div className="w-4"></div>
              <div className="grid grid-cols-8 gap-1">
                {upperTeeth.slice(8).map(tooth => (
                  <ToothButton key={tooth} number={tooth} />
                ))}
              </div>
            </div>
          </div>

          {/* Linha divisória */}
          <div className="border-t border-border"></div>

          {/* Dentes inferiores */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Arcada Inferior</p>
            <div className="flex justify-center">
              <div className="grid grid-cols-8 gap-1">
                {lowerTeeth.slice(0, 8).reverse().map(tooth => (
                  <ToothButton key={tooth} number={tooth} />
                ))}
              </div>
              <div className="w-4"></div>
              <div className="grid grid-cols-8 gap-1">
                {lowerTeeth.slice(8).map(tooth => (
                  <ToothButton key={tooth} number={tooth} />
                ))}
              </div>
            </div>
          </div>

          {selectedTeeth.length > 0 && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">Dentes selecionados:</p>
              <p className="text-sm text-muted-foreground">
                {selectedTeeth.join(", ")}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => {
                  setSelectedTeeth([]);
                  onToothSelect([]);
                }}
              >
                Limpar Seleção
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Odontogram;