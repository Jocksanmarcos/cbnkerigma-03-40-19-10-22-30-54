-- Adicionar configurações de WhatsApp na tabela user_preferences
ALTER TABLE user_preferences 
ADD COLUMN whatsapp_notifications boolean DEFAULT false,
ADD COLUMN whatsapp_number text;