-- Criar políticas para o bucket order-images

-- Política para permitir que usuários autenticados façam upload
CREATE POLICY "Users can upload order images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'order-images' 
  AND auth.uid() IS NOT NULL
);

-- Política para permitir que usuários visualizem as imagens
CREATE POLICY "Users can view order images" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'order-images' 
  AND auth.uid() IS NOT NULL
);

-- Política para permitir que usuários atualizem suas próprias imagens
CREATE POLICY "Users can update order images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'order-images' 
  AND auth.uid() IS NOT NULL
);

-- Política para permitir que usuários deletem suas próprias imagens (se necessário)
CREATE POLICY "Users can delete order images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'order-images' 
  AND auth.uid() IS NOT NULL
);