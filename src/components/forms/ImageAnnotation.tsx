import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AnnotatedImage {
  file: File;
  annotations: Array<{
    id: string;
    x: number;
    y: number;
    text: string;
  }>;
}

const ImageAnnotation = ({ 
  images, 
  onImagesChange 
}: { 
  images: AnnotatedImage[];
  onImagesChange: (images: AnnotatedImage[]) => void;
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationText, setAnnotationText] = useState("");
  const [annotationPos, setAnnotationPos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImages: AnnotatedImage[] = files.map(file => ({
      file,
      annotations: []
    }));
    
    onImagesChange([...images, ...newImages]);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAnnotating || selectedImageIndex === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setAnnotationPos({ x, y });
    setIsAnnotating(false);
    
    // Abrir input para texto da anotação
    const text = prompt("Digite a anotação:");
    if (text) {
      addAnnotation(x, y, text);
    }
  };

  const addAnnotation = (x: number, y: number, text: string) => {
    if (selectedImageIndex === null) return;

    const newAnnotation = {
      id: Date.now().toString(),
      x,
      y,
      text
    };

    const updatedImages = [...images];
    updatedImages[selectedImageIndex].annotations.push(newAnnotation);
    onImagesChange(updatedImages);
  };

  const removeAnnotation = (annotationId: string) => {
    if (selectedImageIndex === null) return;

    const updatedImages = [...images];
    updatedImages[selectedImageIndex].annotations = 
      updatedImages[selectedImageIndex].annotations.filter(a => a.id !== annotationId);
    onImagesChange(updatedImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentação Visual com Anotações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload de imagens */}
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-primary text-xl">📸</span>
            </div>
            <div>
              <p className="text-sm font-medium">Adicionar Imagens</p>
              <p className="text-xs text-muted-foreground">PNG, JPG até 10MB</p>
            </div>
          </label>
        </div>

        {/* Grade de imagens */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <div 
                  className={`border rounded-lg overflow-hidden cursor-pointer ${
                    selectedImageIndex === index ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={URL.createObjectURL(image.file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                  <div className="absolute top-1 right-1 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                  {image.annotations.length > 0 && (
                    <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {image.annotations.length}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Visualizador com anotações */}
        {selectedImageIndex !== null && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={isAnnotating ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAnnotating(!isAnnotating)}
              >
                {isAnnotating ? "Cancelar Anotação" : "Adicionar Anotação"}
              </Button>
            </div>

            <div className="relative border border-border rounded-lg overflow-hidden">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="w-full max-h-96 cursor-crosshair"
                  style={{
                    backgroundImage: `url(${URL.createObjectURL(images[selectedImageIndex].file)})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    aspectRatio: '16/9'
                  }}
                />
                
                {/* Anotações */}
                {images[selectedImageIndex].annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${annotation.x}%`,
                      top: `${annotation.y}%`
                    }}
                  >
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs border-2 border-white shadow-lg cursor-pointer group">
                      <span>•</span>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                        <div className="bg-card text-card-foreground p-2 rounded shadow-lg border text-xs whitespace-nowrap">
                          {annotation.text}
                          <button
                            onClick={() => removeAnnotation(annotation.id)}
                            className="ml-2 text-destructive hover:text-destructive/80"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lista de anotações */}
            {images[selectedImageIndex].annotations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Anotações:</h4>
                {images[selectedImageIndex].annotations.map((annotation, idx) => (
                  <div key={annotation.id} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                    <span>{idx + 1}. {annotation.text}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAnnotation(annotation.id)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageAnnotation;