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

  // Numeração FDI dos dentes
  const upperTeeth = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
  const lowerTeeth = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

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

  // Componente do dente individual
  const Tooth = ({ 
    number, 
    x, 
    y, 
    type = "molar" 
  }: { 
    number: string; 
    x: number; 
    y: number; 
    type?: "incisor" | "canine" | "premolar" | "molar";
  }) => {
    const isSelected = isToothSelected(number);
    const isHovered = hoveredTooth === number;
    
    // Definir dimensões baseadas no tipo do dente
    const dimensions = {
      incisor: { width: 16, height: 20, rx: 3 },
      canine: { width: 18, height: 24, rx: 4 },
      premolar: { width: 20, height: 22, rx: 4 },
      molar: { width: 24, height: 26, rx: 5 }
    };
    
    const { width, height, rx } = dimensions[type];
    
    return (
      <g
        className="cursor-pointer transition-all duration-200 hover:scale-105"
        onClick={() => toggleTooth(number)}
        onMouseEnter={() => setHoveredTooth(number)}
        onMouseLeave={() => setHoveredTooth(null)}
      >
        {/* Sombra do dente */}
        <rect
          x={x - width/2 + 1}
          y={y - height/2 + 1}
          width={width}
          height={height}
          rx={rx}
          fill="rgba(0,0,0,0.1)"
        />
        
        {/* Corpo do dente */}
        <rect
          x={x - width/2}
          y={y - height/2}
          width={width}
          height={height}
          rx={rx}
          fill={isSelected ? "hsl(var(--primary))" : isHovered ? "hsl(var(--primary)/50)" : "hsl(var(--card))"}
          stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}
          strokeWidth={isSelected ? "3" : "2"}
          className={`transition-all duration-200 ${isSelected ? "drop-shadow-lg" : ""}`}
        />
        
        {/* Número do dente */}
        <text
          x={x}
          y={y + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-bold pointer-events-none select-none"
          fill={isSelected ? "white" : "hsl(var(--foreground))"}
        >
          {number}
        </text>
      </g>
    );
  };

  // Função para determinar o tipo do dente baseado no número
  const getToothType = (number: string): "incisor" | "canine" | "premolar" | "molar" => {
    const lastDigit = parseInt(number.slice(-1));
    if (lastDigit <= 2) return "incisor";
    if (lastDigit === 3) return "canine";
    if (lastDigit <= 5) return "premolar";
    return "molar";
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
              className="max-w-full h-auto border rounded-lg bg-card"
            >
              {/* Arcada Superior */}
              <g>
                {/* Lado direito superior (18-11) */}
                {upperTeeth.slice(0, 8).map((tooth, index) => {
                  const angle = (index * 22.5) - 78.75; // Ângulo para formar o arco
                  const radius = 100;
                  const x = 300 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 130 + radius * Math.sin((angle * Math.PI) / 180);
                  const type = getToothType(tooth);
                  
                  return (
                    <Tooth
                      key={tooth}
                      number={tooth}
                      x={x}
                      y={y}
                      type={type}
                    />
                  );
                })}
                
                {/* Lado esquerdo superior (21-28) */}
                {upperTeeth.slice(8, 16).map((tooth, index) => {
                  const angle = (index * 22.5) + 101.25; // Ângulo para formar o arco
                  const radius = 100;
                  const x = 300 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 130 + radius * Math.sin((angle * Math.PI) / 180);
                  const type = getToothType(tooth);
                  
                  return (
                    <Tooth
                      key={tooth}
                      number={tooth}
                      x={x}
                      y={y}
                      type={type}
                    />
                  );
                })}
              </g>

              {/* Arcada Inferior */}
              <g>
                {/* Lado direito inferior (48-41) */}
                {lowerTeeth.slice(0, 8).map((tooth, index) => {
                  const angle = (-index * 22.5) + 78.75; // Ângulo para formar o arco
                  const radius = 100;
                  const x = 300 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 270 + radius * Math.sin((angle * Math.PI) / 180);
                  const type = getToothType(tooth);
                  
                  return (
                    <Tooth
                      key={tooth}
                      number={tooth}
                      x={x}
                      y={y}
                      type={type}
                    />
                  );
                })}
                
                {/* Lado esquerdo inferior (31-38) */}
                {lowerTeeth.slice(8, 16).map((tooth, index) => {
                  const angle = (-index * 22.5) - 101.25; // Ângulo para formar o arco
                  const radius = 100;
                  const x = 300 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 270 + radius * Math.sin((angle * Math.PI) / 180);
                  const type = getToothType(tooth);
                  
                  return (
                    <Tooth
                      key={tooth}
                      number={tooth}
                      x={x}
                      y={y}
                      type={type}
                    />
                  );
                })}
              </g>

              {/* Tooltip */}
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