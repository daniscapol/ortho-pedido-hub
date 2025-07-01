-- Create patients table
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  dentist TEXT NOT NULL,
  prosthesis_type TEXT NOT NULL,
  material TEXT,
  color TEXT,
  priority TEXT NOT NULL,
  deadline DATE NOT NULL,
  observations TEXT,
  delivery_address TEXT,
  selected_teeth TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pendente' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create order_images table
CREATE TABLE order_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  annotations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  sender_type TEXT CHECK (sender_type IN ('dentist', 'lab')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Patients policies
CREATE POLICY "Users can view all patients" ON patients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert patients" ON patients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update patients" ON patients
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Orders policies
CREATE POLICY "Users can view their orders" ON orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their orders" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their orders" ON orders
  FOR UPDATE USING (user_id = auth.uid());

-- Order images policies
CREATE POLICY "Users can view images of their orders" ON order_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_images.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert images for their orders" ON order_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_images.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Chat messages policies
CREATE POLICY "Users can view messages of their orders" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = chat_messages.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages for their orders" ON chat_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = chat_messages.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_patient_id ON orders(patient_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_images_order_id ON order_images(order_id);
CREATE INDEX idx_chat_messages_order_id ON chat_messages(order_id);
CREATE INDEX idx_patients_cpf ON patients(cpf);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();