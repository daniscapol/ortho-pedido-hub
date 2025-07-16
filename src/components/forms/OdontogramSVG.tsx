import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mapeamento dos IDs do SVG para numeração FDI
const toothMapping: Record<string, string> = {
  // Arcada superior direita (18-11)
  "tooth_1": "18", "tooth_2": "17", "tooth_3": "16", "tooth_4": "15",
  "tooth_5": "14", "tooth_6": "13", "tooth_7": "12", "tooth_8": "11",
  
  // Arcada superior esquerda (21-28)
  "tooth_9": "21", "tooth_10": "22", "tooth_11": "23", "tooth_12": "24",
  "tooth_13": "25", "tooth_14": "26", "tooth_15": "27", "tooth_16": "28",
  
  // Arcada inferior direita (48-41)
  "tooth_17": "48", "tooth_18": "47", "tooth_19": "46", "tooth_20": "45",
  "tooth_21": "44", "tooth_22": "43", "tooth_23": "42", "tooth_24": "41",
  
  // Arcada inferior esquerda (31-38)
  "tooth_25": "31", "tooth_26": "32", "tooth_27": "33", "tooth_28": "34",
  "tooth_29": "35", "tooth_30": "36", "tooth_31": "37", "tooth_32": "38"
};

// Mapeamento inverso para encontrar o ID do SVG a partir do número FDI
const fdaToSvgId: Record<string, string> = Object.fromEntries(
  Object.entries(toothMapping).map(([svgId, fdaNumber]) => [fdaNumber, svgId])
);

const OdontogramSVG = ({ 
  onToothSelect, 
  selectedTeeth: externalSelectedTeeth 
}: { 
  onToothSelect: (teeth: string[]) => void;
  selectedTeeth?: string[];
}) => {
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>(externalSelectedTeeth || []);
  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null);

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

  const handleToothClick = (svgId: string) => {
    const toothNumber = toothMapping[svgId];
    if (toothNumber) {
      toggleTooth(toothNumber);
    }
  };

  const handleToothHover = (svgId: string) => {
    const toothNumber = toothMapping[svgId];
    setHoveredTooth(toothNumber);
  };

  const handleToothLeave = () => {
    setHoveredTooth(null);
  };

  const isToothSelected = (svgId: string) => {
    const toothNumber = toothMapping[svgId];
    return toothNumber && selectedTeeth.includes(toothNumber);
  };

  const isToothHovered = (svgId: string) => {
    const toothNumber = toothMapping[svgId];
    return toothNumber === hoveredTooth;
  };

  const getToothClassName = (svgId: string) => {
    const baseClass = "tooth-element";
    const selected = isToothSelected(svgId);
    const hovered = isToothHovered(svgId);
    
    return `${baseClass} ${selected ? 'tooth-selected' : ''} ${hovered ? 'tooth-hovered' : ''}`;
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
            <div className="relative inline-block">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                version="1.1" 
                width="583" 
                height="948" 
                viewBox="0 0 583 948"
                className="max-w-full h-auto cursor-pointer"
                style={{ maxHeight: "500px", background: "hsl(var(--card))" }}
              >
                <style>{`
                  .tooth-element {
                    transition: all 0.3s ease;
                    cursor: pointer;
                  }
                  .tooth-element:hover,
                  .tooth-hovered {
                    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8)) brightness(1.2);
                  }
                  .tooth-selected {
                    filter: drop-shadow(0 0 12px rgba(34, 197, 94, 1)) brightness(1.3);
                  }
                  .tooth-selected path {
                    fill: rgba(34, 197, 94, 0.4) !important;
                    stroke: rgba(34, 197, 94, 0.8) !important;
                    stroke-width: 2 !important;
                  }
                  .tooth-number {
                    font-family: ui-sans-serif, system-ui, sans-serif;
                    font-size: 14px;
                    font-weight: bold;
                    fill: hsl(var(--foreground));
                    text-anchor: middle;
                    dominant-baseline: middle;
                    pointer-events: none;
                    text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
                  }
                `}</style>
                
                {/* Carregar o SVG inline */}
                <image 
                  href="/teeest_with_ids_full.svg" 
                  width="583" 
                  height="948" 
                  x="0" 
                  y="0" 
                />
                
                {/* Overlay interativo com áreas clicáveis */}
                {Object.keys(toothMapping).map(svgId => {
                  // Posições aproximadas dos dentes baseadas no layout do odontograma
                  const getToothPosition = (id: string) => {
                    const toothNum = toothMapping[id];
                    
                    // Arcada superior (18-28)
                    if (['18', '17', '16', '15', '14', '13', '12', '11'].includes(toothNum)) {
                      const index = ['18', '17', '16', '15', '14', '13', '12', '11'].indexOf(toothNum);
                      return { x: 480 - (index * 50), y: 200 };
                    }
                    if (['21', '22', '23', '24', '25', '26', '27', '28'].includes(toothNum)) {
                      const index = ['21', '22', '23', '24', '25', '26', '27', '28'].indexOf(toothNum);
                      return { x: 130 + (index * 50), y: 200 };
                    }
                    
                    // Arcada inferior (48-38)
                    if (['48', '47', '46', '45', '44', '43', '42', '41'].includes(toothNum)) {
                      const index = ['48', '47', '46', '45', '44', '43', '42', '41'].indexOf(toothNum);
                      return { x: 480 - (index * 50), y: 750 };
                    }
                    if (['31', '32', '33', '34', '35', '36', '37', '38'].includes(toothNum)) {
                      const index = ['31', '32', '33', '34', '35', '36', '37', '38'].indexOf(toothNum);
                      return { x: 130 + (index * 50), y: 750 };
                    }
                    
                    return { x: 300, y: 400 };
                  };
                  
                  const pos = getToothPosition(svgId);
                  
                  return (
                    <g key={svgId}>
                      {/* Área clicável invisível */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="20"
                        fill="transparent"
                        className={getToothClassName(svgId)}
                        onClick={() => handleToothClick(svgId)}
                        onMouseEnter={() => handleToothHover(svgId)}
                        onMouseLeave={handleToothLeave}
                      />
                      
                      {/* Indicador visual quando selecionado */}
                      {isToothSelected(svgId) && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="18"
                          fill="rgba(34, 197, 94, 0.2)"
                          stroke="rgba(34, 197, 94, 0.8)"
                          strokeWidth="3"
                          className="animate-pulse"
                          pointerEvents="none"
                        />
                      )}
                      
                      {/* Número do dente */}
                      <text 
                        x={pos.x}
                        y={pos.y + 30}
                        className="tooth-number"
                        pointerEvents="none"
                      >
                        {toothMapping[svgId]}
                      </text>
                    </g>
                  );
                })}
                
                {/* Tooltip para dente em hover */}
                {hoveredTooth && (
                  <g>
                    <rect
                      x="220"
                      y="10"
                      width="140"
                      height="40"
                      rx="8"
                      fill="hsl(var(--popover))"
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                      filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
                    />
                    <text 
                      x="290" 
                      y="32" 
                      className="tooth-number"
                      style={{ fontSize: "16px", fill: "hsl(var(--popover-foreground))" }}
                    >
                      Dente: {hoveredTooth}
                    </text>
                  </g>
                )}
              </svg>
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

export default OdontogramSVG;