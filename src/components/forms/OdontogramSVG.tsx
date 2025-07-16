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

  // Componente do dente individual com formas realistas + ícones
  const Tooth = ({ 
    number, 
    x, 
    y, 
    type = "molar",
    rotation = 0 
  }: { 
    number: string; 
    x: number; 
    y: number; 
    type?: "incisor" | "canine" | "premolar" | "molar";
    rotation?: number;
  }) => {
    const isSelected = isToothSelected(number);
    const isHovered = hoveredTooth === number;
    
    // Formas anatômicas realistas para cada tipo de dente
    const getToothPath = (type: string) => {
      switch (type) {
        case "incisor":
          return "M -6,-15 C -8,-16 -8,-14 -6,-12 L -6,8 C -6,12 -4,15 0,15 C 4,15 6,12 6,8 L 6,-12 C 8,-14 8,-16 6,-15 C 4,-14 2,-14 0,-14 C -2,-14 -4,-14 -6,-15 Z";
        case "canine":
          return "M -7,-18 C -9,-19 -9,-17 -7,-15 L -7,10 C -7,14 -5,17 0,17 C 5,17 7,14 7,10 L 7,-15 C 9,-17 9,-19 7,-18 C 5,-17 2,-17 0,-16 C -2,-17 -5,-17 -7,-18 Z";
        case "premolar":
          return "M -8,-12 C -10,-13 -10,-11 -8,-9 L -8,8 C -8,12 -6,15 0,15 C 6,15 8,12 8,8 L 8,-9 C 10,-11 10,-13 8,-12 C 6,-11 3,-11 0,-11 C -3,-11 -6,-11 -8,-12 Z M -3,-8 C -1,-9 1,-9 3,-8 C 2,-6 1,-6 0,-6 C -1,-6 -2,-6 -3,-8 Z";
        case "molar":
          return "M -10,-12 C -12,-13 -12,-11 -10,-9 L -10,10 C -10,14 -8,17 0,17 C 8,17 10,14 10,10 L 10,-9 C 12,-11 12,-13 10,-12 C 8,-11 5,-11 0,-11 C -5,-11 -8,-11 -10,-12 Z M -4,-8 C -2,-9 0,-9 2,-8 C 1,-6 0,-6 -1,-6 C -2,-6 -3,-6 -4,-8 Z M 2,-8 C 4,-9 6,-9 8,-8 C 7,-6 6,-6 5,-6 C 4,-6 3,-6 2,-8 Z";
        default:
          return "M -8,-12 C -10,-13 -10,-11 -8,-9 L -8,8 C -8,12 -6,15 0,15 C 6,15 8,12 8,8 L 8,-9 C 10,-11 10,-13 8,-12 C 6,-11 3,-11 0,-11 C -3,-11 -6,-11 -8,-12 Z";
      }
    };
    
    const fillColor = isSelected 
      ? "hsl(var(--primary))" 
      : isHovered 
        ? "hsl(var(--primary)/50)" 
        : "#f8f8f8";
    
    const strokeColor = isSelected 
      ? "hsl(var(--primary))" 
      : "#d4d4d4";

    // Escolher o ícone baseado no estado
    const getToothIcon = () => {
      if (isSelected) return toothColorful;
      if (isHovered) return toothIcon;
      return toothOutline;
    };
    
    return (
      <g
        transform={`translate(${x}, ${y}) rotate(${rotation})`}
        className="cursor-pointer transition-all duration-200 hover:scale-105"
        onClick={() => toggleTooth(number)}
        onMouseEnter={() => setHoveredTooth(number)}
        onMouseLeave={() => setHoveredTooth(null)}
      >
        {/* Sombra do dente */}
        <path
          d={getToothPath(type)}
          fill="rgba(0,0,0,0.1)"
          transform="translate(1, 1)"
        />
        
        {/* Corpo do dente */}
        <path
          d={getToothPath(type)}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={isSelected ? "2.5" : "1.5"}
          className={`transition-all duration-200 ${isSelected ? "drop-shadow-lg" : ""}`}
        />
        
        {/* Raiz do dente (linha sutil) */}
        <line
          x1="0"
          y1="15"
          x2="0"
          y2="20"
          stroke={strokeColor}
          strokeWidth="1"
          opacity="0.5"
        />
        
        {/* Ícone do dente em cima do número */}
        <image
          href={getToothIcon()}
          x="-8"
          y="20"
          width="16"
          height="16"
          className="transition-all duration-200"
          style={{
            filter: isSelected 
              ? "drop-shadow(0 0 4px hsl(var(--primary)))" 
              : "none"
          }}
        />
        
        {/* Número do dente */}
        <text
          x="0"
          y="45"
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
              width="650" 
              height="500" 
              viewBox="0 0 650 500"
              className="max-w-full h-auto border rounded-lg bg-gradient-to-b from-red-50 to-red-100"
            >
              {/* Fundo da boca */}
              <defs>
                <radialGradient id="mouthGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity="0.6" />
                </radialGradient>
              </defs>
              
              {/* Maxila (Arcada Superior) */}
              <ellipse
                cx="325"
                cy="180"
                rx="180"
                ry="120"
                fill="url(#mouthGradient)"
                stroke="#b91c1c"
                strokeWidth="2"
                opacity="0.4"
              />
              
              {/* Mandíbula (Arcada Inferior) */}
              <ellipse
                cx="325"
                cy="320"
                rx="180"
                ry="120"
                fill="url(#mouthGradient)"
                stroke="#b91c1c"
                strokeWidth="2"
                opacity="0.4"
              />

              {/* Labels das arcadas */}
              <text x="500" y="120" className="text-sm font-semibold" fill="hsl(var(--foreground))">
                Maxila
              </text>
              <text x="490" y="450" className="text-sm font-semibold" fill="hsl(var(--foreground))">
                Mandíbula
              </text>
              
              {/* Labels dos lados */}
              <text x="100" y="250" className="text-sm font-medium" fill="hsl(var(--muted-foreground))">
                Lado Direito
              </text>
              <text x="500" y="250" className="text-sm font-medium" fill="hsl(var(--muted-foreground))">
                Lado Esquerdo
              </text>

              {/* Arcada Superior */}
              <g>
                {/* Lado direito superior (18-11) */}
                {upperTeeth.slice(0, 8).map((tooth, index) => {
                  const angle = (index * 22.5) - 78.75; // Ângulo para formar o arco
                  const radius = 120;
                  const x = 325 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 180 + radius * Math.sin((angle * Math.PI) / 180);
                  const type = getToothType(tooth);
                  
                  return (
                    <Tooth
                      key={tooth}
                      number={tooth}
                      x={x}
                      y={y}
                      type={type}
                      rotation={angle + 90}
                    />
                  );
                })}
                
                {/* Lado esquerdo superior (21-28) */}
                {upperTeeth.slice(8, 16).map((tooth, index) => {
                  const angle = (index * 22.5) + 101.25; // Ângulo para formar o arco
                  const radius = 120;
                  const x = 325 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 180 + radius * Math.sin((angle * Math.PI) / 180);
                  const type = getToothType(tooth);
                  
                  return (
                    <Tooth
                      key={tooth}
                      number={tooth}
                      x={x}
                      y={y}
                      type={type}
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
                  const radius = 120;
                  const x = 325 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 270 + radius * Math.sin((angle * Math.PI) / 180);
                  const type = getToothType(tooth);
                  
                  return (
                    <Tooth
                      key={tooth}
                      number={tooth}
                      x={x}
                      y={y}
                      type={type}
                      rotation={angle - 90}
                    />
                  );
                })}
                
                {/* Lado esquerdo inferior (31-38) */}
                {lowerTeeth.slice(8, 16).map((tooth, index) => {
                  const angle = (-index * 22.5) - 101.25; // Ângulo para formar o arco
                  const radius = 120;
                  const x = 325 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 270 + radius * Math.sin((angle * Math.PI) / 180);
                  const type = getToothType(tooth);
                  
                  return (
                    <Tooth
                      key={tooth}
                      number={tooth}
                      x={x}
                      y={y}
                      type={type}
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