import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface AnnotatedImage {
  file: File;
  annotations: Array<{
    id: string;
    x: number;
    y: number;
    text: string;
  }>;
}

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadImages = async (images: AnnotatedImage[], orderId: string) => {
    if (images.length === 0) return [];

    setIsUploading(true);
    const uploadedImages = [];

    try {
      for (const image of images) {
        // Generate unique filename
        const fileExt = image.file.name.split('.').pop();
        const fileName = `${orderId}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('order-images')
          .upload(fileName, image.file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Save image record to database
        const { data: imageRecord, error: dbError } = await supabase
          .from('order_images')
          .insert({
            order_id: orderId,
            image_url: uploadData.path,
            annotations: image.annotations
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }

        uploadedImages.push(imageRecord);
      }

      toast({
        title: "Imagens enviadas",
        description: `${images.length} imagem(ns) enviada(s) com sucesso!`,
      });

      return uploadedImages;
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: "Erro no upload",
        description: "Erro ao enviar imagens: " + error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImages,
    isUploading
  };
};