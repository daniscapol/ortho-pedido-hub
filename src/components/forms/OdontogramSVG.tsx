import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toothIcon from "@/assets/tooth-icon.png";
import toothColorful from "@/assets/tooth-colorful.png";
import toothOutline from "@/assets/tooth-outline.png";

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

  // Componente do dente individual usando ícones reais
  const Tooth = ({ 
    number, 
    x, 
    y, 
    rotation = 0 
  }: { 
    number: string; 
    x: number; 
    y: number; 
    rotation?: number;
  }) => {
    const isSelected = isToothSelected(number);
    const isHovered = hoveredTooth === number;
    
    // Escolher o ícone baseado no estado
    const getToothIcon = () => {
      if (isSelected) return toothColorful;
      if (isHovered) return toothIcon;
      return toothOutline;
    };
    
    return (
      <g
        transform={`translate(${x}, ${y}) rotate(${rotation})`}
        className="cursor-pointer transition-all duration-200 hover:scale-110"
        onClick={() => toggleTooth(number)}
        onMouseEnter={() => setHoveredTooth(number)}
        onMouseLeave={() => setHoveredTooth(null)}
      >
        {/* Sombra do dente */}
        <circle
          cx="1"
          cy="1"
          r="18"
          fill="rgba(0,0,0,0.1)"
        />
        
        {/* Fundo circular para destacar o dente */}
        <circle
          cx="0"
          cy="0"
          r="18"
          fill={isSelected ? "hsl(var(--primary))" : isHovered ? "hsl(var(--primary)/20)" : "transparent"}
          stroke={isSelected ? "hsl(var(--primary))" : isHovered ? "hsl(var(--primary)/50)" : "transparent"}
          strokeWidth="2"
          className="transition-all duration-200"
        />
        
        {/* Ícone do dente */}
        <image
          href={getToothIcon()}
          x="-12"
          y="-12"
          width="24"
          height="24"
          className={`transition-all duration-200 ${isSelected ? "drop-shadow-lg" : ""}`}
          style={{
            filter: isSelected 
              ? "drop-shadow(0 0 8px hsl(var(--primary)))" 
              : isHovered 
                ? "drop-shadow(0 0 4px hsl(var(--primary)/50))" 
                : "none"
          }}
        />
        
        {/* Número do dente */}
        <text
          x="0"
          y="32"
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-bold pointer-events-none select-none"
          fill={isSelected ? "hsl(var(--primary))" : "hsl(var(--foreground))"}
        >
          {number}
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
              width="650" 
              height="500" 
              viewBox="0 0 650 500"
              className="max-w-full h-auto border rounded-lg bg-gradient-to-b from-blue-50 to-blue-100"
            >
              {/* Fundo da boca */}
              <defs>
                <radialGradient id="mouthGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
                </radialGradient>
              </defs>
              
              {/* Maxila (Arcada Superior) */}
              <ellipse
                cx="325"
                cy="180"
                rx="200"
                ry="130"
                fill="url(#mouthGradient)"
                stroke="#0284c7"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.3"
              />
              
              {/* Mandíbula (Arcada Inferior) */}
              <ellipse
                cx="325"
                cy="320"
                rx="200"
                ry="130"
                fill="url(#mouthGradient)"
                stroke="#0284c7"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.3"
              />

              {/* Labels das arcadas */}
              <text x="500" y="120" className="text-sm font-semibold" fill="hsl(var(--foreground))">
                Maxila
              </text>
              <text x="490" y="450" className="text-sm font-semibold" fill="hsl(var(--foreground))">
                Mandíbula
              </text>
              
              {/* Labels dos lados */}
              <text x="80" y="250" className="text-sm font-medium" fill="hsl(var(--muted-foreground))">
                Lado Direito
              </text>
              <text x="520" y="250" className="text-sm font-medium" fill="hsl(var(--muted-foreground))">
                Lado Esquerdo
              </text>

              {/* Arcada Superior */}
              <g>
                {/* Lado direito superior (18-11) */}
                {upperTeeth.slice(0, 8).map((tooth, index) => {
                  const angle = (index * 22.5) - 78.75; // Ângulo para formar o arco
                  const radius = 130;
                  const x = 325 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 180 + radius * Math.sin((angle * Math.PI) / 180);
                  
                  return (
                    <Tooth
                      key={tooth}
                      number={tooth}
                      x={x}
                      y={y}
                      rotation={angle + 90}
                    />
                  );
                })}
                
                {/* Lado esquerdo superior (21-28) */}
                {upperTeeth.slice(8, 16).map((tooth, index) => {
                  const angle = (index * 22.5) + 101.25; // Ângulo para formar o arco
                  const radius = 130;
                  const x = 325 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 180 + radius * Math.sin((angle * Math.PI) / 180);
                  
                  return (
                    <Tooth
                      key={tooth}
                      number={tooth}
                      x={x}
                      y={y}
                      rotation={angle + 90}
                    />
                  );
                })}
              </g>

              {/* Arcada Inferior */}
              <g>
                {/* Lado direito inferior (48-41) */}
                {lowerTeeth.slice(0, 8).map((tooth, index) => {
                  const angle = (-index * 22.5) + 78.75; // Ângulo para formar o arco
                  const radius = 130;
                  const x = 325 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 320 + radius * Math.sin((angle * Math.PI) / 180);
                  
                  return (
                    <Tooth
                      key={tooth}
                      number={tooth}
                      x={x}
                      y={y}
                      rotation={angle - 90}
                    />
                  );
                })}
                
                {/* Lado esquerdo inferior (31-38) */}
                {lowerTeeth.slice(8, 16).map((tooth, index) => {
                  const angle = (-index * 22.5) - 101.25; // Ângulo para formar o arco
                  const radius = 130;
                  const x = 325 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 320 + radius * Math.sin((angle * Math.PI) / 180);
                  
                  return (
                    <Tooth
                      key={tooth}
                      number={tooth}
                      x={x}
                      y={y}
                      rotation={angle - 90}
                    />
                  );
                })}
              </g>

              {/* Tooltip */}
              {hoveredTooth && (
                <g>
                  <rect
                    x="250"
                    y="20"
                    width="150"
                    height="30"
                    rx="8"
                    fill="hsl(var(--popover))"
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
                  />
                  <text 
                    x="325" 
                    y="38" 
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