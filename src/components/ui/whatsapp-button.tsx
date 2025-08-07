import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "5598988734670"; // +55 98 98873-4670
    const message = "Olá! Gostaria de saber mais sobre a CBN Kerigma e suas células.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-whatsapp hover:bg-whatsapp/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group animate-scale-in"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
      
      {/* Tooltip */}
      <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-secondary text-secondary-foreground text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Fale conosco no WhatsApp
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-secondary"></div>
      </div>
    </button>
  );
};

export default WhatsAppButton;