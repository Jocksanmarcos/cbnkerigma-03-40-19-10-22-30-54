import { Heart, Phone, Mail, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import logoCbn from "@/assets/logo-cbn.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 lg:col-span-2">
            <div className="mb-4">
              <img 
                src="/lovable-uploads/5250fbca-4177-44c5-bbde-36dd7f51e2e9.png" 
                alt="CBN Kerigma" 
                className="h-16 w-auto"
              />
            </div>
            
            <p className="text-background/80 mb-6 max-w-md">
              Uma igreja que acredita no poder do evangelismo e relacionamento através do trabalho em células. 
              Venha fazer parte da nossa família!
            </p>

            {/* Redes Sociais */}
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/cbnkerigma" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com/cbnkerigma" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com/@cbnkerigma" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors duration-300"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
            
            {/* Logo CBN */}
             <div className="mt-6">
                <img 
                  src={logoCbn} 
                  alt="Convenção Batista Nacional" 
                  className="h-12 w-auto mx-auto opacity-80 dark:filter dark:invert dark:brightness-0 dark:contrast-100"
                />
             </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-background">Links Rápidos</h4>
            <ul className="space-y-2">
              <li><Link to="/sobre" className="text-background/80 hover:text-primary transition-colors">Sobre Nós</Link></li>
              <li><Link to="/celulas" className="text-background/80 hover:text-primary transition-colors">Nossas Células</Link></li>
              <li><Link to="/agenda" className="text-background/80 hover:text-primary transition-colors">Agenda</Link></li>
              <li><Link to="/galeria" className="text-background/80 hover:text-primary transition-colors">Galeria</Link></li>
              <li><Link to="/contato" className="text-background/80 hover:text-primary transition-colors">Contato</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-background">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-background/80">(98) 98873-4670</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-background/80">contato@cbnkerigma.org.br</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-primary mt-1" />
                <span className="text-background/80">Estrada de Ribamar, Km 2, N.º 5<br />Aurora - São Luís - MA, Brasil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha divisória e copyright */}
        <div className="border-t border-background/20 mt-8 pt-8 text-center">
          <p className="text-background/80 text-sm">
            © 2024 Comunidade Batista Nacional Kerigma. Todos os direitos reservados.
          </p>
          <p className="text-background/60 text-xs mt-2 flex items-center justify-center">
            Feito com <Heart className="w-4 h-4 text-primary mx-1" /> para a glória de Deus
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;