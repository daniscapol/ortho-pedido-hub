import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Odontogram = ({ onToothSelect }: { onToothSelect: (teeth: string[]) => void }) => {
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);

  const toggleTooth = (tooth: string) => {
    const newSelection = selectedTeeth.includes(tooth)
      ? selectedTeeth.filter(t => t !== tooth)
      : [...selectedTeeth, tooth];
    
    setSelectedTeeth(newSelection);
    onToothSelect(newSelection);
  };

  // Coordenadas dos dentes na imagem (em percentual)
  const toothCoordinates = {
    // Arcada Superior (de 18 até 28)
    "18": { x: 4, y: 15, width: 12, height: 15 },
    "17": { x: 12, y: 8, width: 12, height: 15 },
    "16": { x: 20, y: 2, width: 12, height: 15 },
    "15": { x: 28, y: 0, width: 10, height: 12 },
    "14": { x: 36, y: 0, width: 10, height: 12 },
    "13": { x: 44, y: 0, width: 8, height: 18 },
    "12": { x: 50, y: 0, width: 8, height: 18 },
    "11": { x: 56, y: 0, width: 8, height: 18 },
    "21": { x: 62, y: 0, width: 8, height: 18 },
    "22": { x: 68, y: 0, width: 8, height: 18 },
    "23": { x: 74, y: 0, width: 8, height: 18 },
    "24": { x: 80, y: 0, width: 10, height: 12 },
    "25": { x: 88, y: 0, width: 10, height: 12 },
    "26": { x: 96, y: 2, width: 12, height: 15 },
    "27": { x: 104, y: 8, width: 12, height: 15 },
    "28": { x: 112, y: 15, width: 12, height: 15 },
    
    // Arcada Inferior (de 48 até 38)
    "48": { x: 4, y: 68, width: 12, height: 15 },
    "47": { x: 12, y: 74, width: 12, height: 15 },
    "46": { x: 20, y: 80, width: 12, height: 15 },
    "45": { x: 28, y: 85, width: 10, height: 12 },
    "44": { x: 36, y: 87, width: 10, height: 12 },
    "43": { x: 44, y: 82, width: 8, height: 15 },
    "42": { x: 50, y: 82, width: 8, height: 15 },
    "41": { x: 56, y: 82, width: 8, height: 15 },
    "31": { x: 62, y: 82, width: 8, height: 15 },
    "32": { x: 68, y: 82, width: 8, height: 15 },
    "33": { x: 74, y: 82, width: 8, height: 15 },
    "34": { x: 80, y: 87, width: 10, height: 12 },
    "35": { x: 88, y: 85, width: 10, height: 12 },
    "36": { x: 96, y: 80, width: 12, height: 15 },
    "37": { x: 104, y: 74, width: 12, height: 15 },
    "38": { x: 112, y: 68, width: 12, height: 15 },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Odontograma - Seleção de Dentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Imagem interativa do odontograma */}
          <div className="relative inline-block">
            <img 
              src="/lovable-uploads/aca88e5b-58a7-4ac4-b737-e861ff02201b.png" 
              alt="Odontograma" 
              className="max-w-full h-auto"
              style={{ maxWidth: '500px' }}
            />
            
            {/* Botões invisíveis sobre cada dente */}
            {Object.entries(toothCoordinates).map(([tooth, coords]) => {
              const isSelected = selectedTeeth.includes(tooth);
              return (
                <button
                  key={tooth}
                  onClick={() => toggleTooth(tooth)}
                  className={`absolute border-2 rounded transition-all duration-200 ${
                    isSelected 
                      ? "bg-primary/30 border-primary shadow-lg" 
                      : "bg-transparent border-transparent hover:bg-primary/10 hover:border-primary/50"
                  }`}
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    width: `${coords.width}%`,
                    height: `${coords.height}%`,
                  }}
                  title={`Dente ${tooth}`}
                />
              );
            })}
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