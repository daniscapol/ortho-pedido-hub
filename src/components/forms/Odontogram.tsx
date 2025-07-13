import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import odontogramaSvg from "@/assets/odontograma.svg";

const Odontogram = ({ onToothSelect }: { onToothSelect: (teeth: string[]) => void }) => {
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);

  const toggleTooth = (tooth: string) => {
    const newSelection = selectedTeeth.includes(tooth)
      ? selectedTeeth.filter(t => t !== tooth)
      : [...selectedTeeth, tooth];
    
    setSelectedTeeth(newSelection);
    onToothSelect(newSelection);
  };

  const handleSvgClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    const toothGroup = target.closest('.tooth') as SVGGElement;
    
    if (toothGroup) {
      const toothNumber = toothGroup.getAttribute('data-number');
      if (toothNumber) {
        toggleTooth(toothNumber);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Odontograma - Seleção de Dentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-center">
            <div 
              className="odontogram-container"
              dangerouslySetInnerHTML={{ 
                __html: `
                  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="583px" height="400px" viewBox="0 0 583 800" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd; cursor: pointer;" onclick="handleSvgClick(event)">
                    ${Array.from([18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]).map((tooth, index) => {
                      const isSelected = selectedTeeth.includes(tooth.toString());
                      const x = 50 + (index * 60);
                      const y = 50;
                      return `
                        <g id="tooth-${tooth}" class="tooth" data-number="${tooth}" style="cursor: pointer;">
                          <ellipse cx="${x}" cy="${y}" rx="25" ry="40" style="opacity:1" fill="${isSelected ? 'hsl(var(--primary))' : '#fafafa'}" stroke="#333" stroke-width="2"/>
                          <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="12" fill="#333">${tooth}</text>
                        </g>
                      `;
                    }).join('')}
                    
                    ${Array.from([48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]).map((tooth, index) => {
                      const isSelected = selectedTeeth.includes(tooth.toString());
                      const x = 50 + (index * 60);
                      const y = 200;
                      return `
                        <g id="tooth-${tooth}" class="tooth" data-number="${tooth}" style="cursor: pointer;">
                          <ellipse cx="${x}" cy="${y}" rx="25" ry="40" style="opacity:1" fill="${isSelected ? 'hsl(var(--primary))' : '#fafafa'}" stroke="#333" stroke-width="2"/>
                          <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="12" fill="#333">${tooth}</text>
                        </g>
                      `;
                    }).join('')}
                  </svg>
                `
              }}
              onClick={handleSvgClick}
            />
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