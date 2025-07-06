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

  // Coordenadas aproximadas de cada dente na imagem (em percentual)
  const toothCoordinates = {
    // Arcada Superior (de 18 até 28)
    "18": { x: 12, y: 45, width: 8, height: 12 },
    "17": { x: 20, y: 38, width: 8, height: 12 },
    "16": { x: 28, y: 32, width: 8, height: 12 },
    "15": { x: 36, y: 28, width: 7, height: 10 },
    "14": { x: 43, y: 25, width: 7, height: 10 },
    "13": { x: 50, y: 18, width: 6, height: 14 },
    "12": { x: 56, y: 12, width: 6, height: 14 },
    "11": { x: 62, y: 8, width: 6, height: 14 },
    "21": { x: 68, y: 8, width: 6, height: 14 },
    "22": { x: 74, y: 12, width: 6, height: 14 },
    "23": { x: 80, y: 18, width: 6, height: 14 },
    "24": { x: 87, y: 25, width: 7, height: 10 },
    "25": { x: 94, y: 28, width: 7, height: 10 },
    "26": { x: 101, y: 32, width: 8, height: 12 },
    "27": { x: 109, y: 38, width: 8, height: 12 },
    "28": { x: 117, y: 45, width: 8, height: 12 },
    
    // Arcada Inferior (de 48 até 38)
    "48": { x: 12, y: 78, width: 8, height: 12 },
    "47": { x: 20, y: 71, width: 8, height: 12 },
    "46": { x: 28, y: 65, width: 8, height: 12 },
    "45": { x: 36, y: 62, width: 7, height: 10 },
    "44": { x: 43, y: 59, width: 7, height: 10 },
    "43": { x: 50, y: 78, width: 6, height: 10 },
    "42": { x: 56, y: 82, width: 6, height: 10 },
    "41": { x: 62, y: 84, width: 6, height: 10 },
    "31": { x: 68, y: 84, width: 6, height: 10 },
    "32": { x: 74, y: 82, width: 6, height: 10 },
    "33": { x: 80, y: 78, width: 6, height: 10 },
    "34": { x: 87, y: 59, width: 7, height: 10 },
    "35": { x: 94, y: 62, width: 7, height: 10 },
    "36": { x: 101, y: 65, width: 8, height: 12 },
    "37": { x: 109, y: 71, width: 8, height: 12 },
    "38": { x: 117, y: 78, width: 8, height: 12 },
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