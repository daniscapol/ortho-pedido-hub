import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const OdontogramSVG = ({ 
  onToothSelect, 
  selectedTeeth: externalSelectedTeeth 
}: { 
  onToothSelect: (teeth: string[]) => void;
  selectedTeeth?: string[];
}) => {
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>(externalSelectedTeeth || []);
  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null);

  // Numeração padrão dos dentes (sistema FDI)
  const upperRightTeeth = ["18", "17", "16", "15", "14", "13", "12", "11"];
  const upperLeftTeeth = ["21", "22", "23", "24", "25", "26", "27", "28"];
  const lowerRightTeeth = ["48", "47", "46", "45", "44", "43", "42", "41"];
  const lowerLeftTeeth = ["31", "32", "33", "34", "35", "36", "37", "38"];

  // Atualizar seleção quando prop externa mudar
  useEffect(() => {
    if (externalSelectedTeeth) {
      setSelectedTeeth(externalSelectedTeeth);
    }
  }, [externalSelectedTeeth]);

  const toggleTooth = (toothNumber: string) => {
    const newSelection = selectedTeeth.includes(toothNumber)
      ? selectedTeeth.filter(t => t !== toothNumber)
      : [...selectedTeeth, toothNumber];
    
    setSelectedTeeth(newSelection);
    onToothSelect(newSelection);
  };

  const isToothSelected = (toothNumber: string) => {
    return selectedTeeth.includes(toothNumber);
  };

  const ToothShape = ({ 
    toothNumber, 
    x, 
    y, 
    rotation = 0, 
    isSelected, 
    isHovered,
    onClick 
  }: {
    toothNumber: string;
    x: number;
    y: number;
    rotation?: number;
    isSelected: boolean;
    isHovered: boolean;
    onClick: () => void;
  }) => {
    // Diferentes formas para diferentes tipos de dentes
    const getToothShape = (num: string) => {
      const lastDigit = parseInt(num.slice(-1));
      
      // Incisivos (1, 2)
      if (lastDigit === 1 || lastDigit === 2) {
        return (
          <path d="M -8,-12 L 8,-12 L 6,12 L -6,12 Z" />
        );
      }
      // Caninos (3)
      if (lastDigit === 3) {
        return (
          <path d="M -6,-15 L 6,-15 L 8,12 L -8,12 Z" />
        );
      }
      // Pré-molares (4, 5)
      if (lastDigit === 4 || lastDigit === 5) {
        return (
          <rect x="-8" y="-10" width="16" height="20" rx="2" />
        );
      }
      // Molares (6, 7, 8)
      return (
        <rect x="-10" y="-12" width="20" height="24" rx="3" />
      );
    };

    const fillColor = isSelected 
      ? "rgba(34, 197, 94, 0.8)" 
      : isHovered 
        ? "rgba(59, 130, 246, 0.3)"
        : "hsl(var(--background))";
    
    const strokeColor = isSelected 
      ? "rgba(34, 197, 94, 1)" 
      : "hsl(var(--border))";

    return (
      <g 
        transform={`translate(${x}, ${y}) rotate(${rotation})`}
        className="cursor-pointer transition-all duration-200 hover:scale-110"
        onClick={onClick}
        onMouseEnter={() => setHoveredTooth(toothNumber)}
        onMouseLeave={() => setHoveredTooth(null)}
      >
        {/* Dente */}
        <g 
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={isSelected ? "3" : "2"}
          filter={isSelected ? "drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))" : "none"}
        >
          {getToothShape(toothNumber)}
        </g>
        
        {/* Número do dente */}
        <text 
          x="0" 
          y="4" 
          textAnchor="middle" 
          className="text-xs font-bold pointer-events-none select-none"
          fill="hsl(var(--foreground))"
        >
          {toothNumber}
        </text>
      </g>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Odontograma - Seleção de Dentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Container do SVG */}
          <div className="relative flex justify-center">
            <svg 
              width="600" 
              height="400" 
              viewBox="0 0 600 400"
              className="max-w-full h-auto"
            >
              <style>{`
                .tooth-element {
                  transition: all 0.3s ease;
                }
              `}</style>
              
              {/* Arcada Superior */}
              <g>
                {/* Lado direito superior (18-11) */}
                {upperRightTeeth.map((tooth, index) => {
                  const angle = (index * 20) - 70; // Ângulo para formar o arco
                  const radius = 120;
                  const x = 300 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 120 + radius * Math.sin((angle * Math.PI) / 180);
                  
                  return (
                    <ToothShape
                      key={tooth}
                      toothNumber={tooth}
                      x={x}
                      y={y}
                      rotation={angle + 90}
                      isSelected={isToothSelected(tooth)}
                      isHovered={hoveredTooth === tooth}
                      onClick={() => toggleTooth(tooth)}
                    />
                  );
                })}
                
                {/* Lado esquerdo superior (21-28) */}
                {upperLeftTeeth.map((tooth, index) => {
                  const angle = (index * 20) + 110; // Ângulo para formar o arco
                  const radius = 120;
                  const x = 300 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 120 + radius * Math.sin((angle * Math.PI) / 180);
                  
                  return (
                    <ToothShape
                      key={tooth}
                      toothNumber={tooth}
                      x={x}
                      y={y}
                      rotation={angle + 90}
                      isSelected={isToothSelected(tooth)}
                      isHovered={hoveredTooth === tooth}
                      onClick={() => toggleTooth(tooth)}
                    />
                  );
                })}
              </g>

              {/* Arcada Inferior */}
              <g>
                {/* Lado direito inferior (48-41) */}
                {lowerRightTeeth.map((tooth, index) => {
                  const angle = (-index * 20) + 70; // Ângulo para formar o arco
                  const radius = 120;
                  const x = 300 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 280 + radius * Math.sin((angle * Math.PI) / 180);
                  
                  return (
                    <ToothShape
                      key={tooth}
                      toothNumber={tooth}
                      x={x}
                      y={y}
                      rotation={angle - 90}
                      isSelected={isToothSelected(tooth)}
                      isHovered={hoveredTooth === tooth}
                      onClick={() => toggleTooth(tooth)}
                    />
                  );
                })}
                
                {/* Lado esquerdo inferior (31-38) */}
                {lowerLeftTeeth.map((tooth, index) => {
                  const angle = (-index * 20) - 110; // Ângulo para formar o arco
                  const radius = 120;
                  const x = 300 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 280 + radius * Math.sin((angle * Math.PI) / 180);
                  
                  return (
                    <ToothShape
                      key={tooth}
                      toothNumber={tooth}
                      x={x}
                      y={y}
                      rotation={angle - 90}
                      isSelected={isToothSelected(tooth)}
                      isHovered={hoveredTooth === tooth}
                      onClick={() => toggleTooth(tooth)}
                    />
                  );
                })}
              </g>

              {/* Tooltip para dente em hover */}
              {hoveredTooth && (
                <g>
                  <rect
                    x="220"
                    y="10"
                    width="160"
                    height="30"
                    rx="8"
                    fill="hsl(var(--popover))"
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
                  />
                  <text 
                    x="300" 
                    y="28" 
                    textAnchor="middle"
                    className="text-sm font-medium"
                    fill="hsl(var(--popover-foreground))"
                  >
                    Dente: {hoveredTooth}
                  </text>
                </g>
              )}
            </svg>
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

export default OdontogramSVG;