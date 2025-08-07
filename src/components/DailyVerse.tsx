import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Quote } from "lucide-react";

const DailyVerse = () => {
  // Lista de versículos bíblicos
  const verses = [
    {
      text: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.",
      reference: "Jeremias 29:11"
    },
    {
      text: "Tudo posso naquele que me fortalece.",
      reference: "Filipenses 4:13"
    },
    {
      text: "O Senhor é o meu pastor; nada me faltará.",
      reference: "Salmos 23:1"
    },
    {
      text: "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento.",
      reference: "Provérbios 3:5"
    },
    {
      text: "Porque onde estiverem dois ou três reunidos em meu nome, aí estou eu no meio deles.",
      reference: "Mateus 18:20"
    },
    {
      text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.",
      reference: "Romanos 8:28"
    },
    {
      text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus.",
      reference: "Isaías 41:10"
    },
    {
      text: "Lança o teu cuidado sobre o Senhor, e ele te susterá; nunca permitirá que o justo seja abalado.",
      reference: "Salmos 55:22"
    },
    {
      text: "Portanto, se alguém está em Cristo, nova criatura é; as coisas velhas já passaram; eis que tudo se fez novo.",
      reference: "2 Coríntios 5:17"
    },
    {
      text: "Mas buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.",
      reference: "Mateus 6:33"
    },
    {
      text: "E conhecereis a verdade, e a verdade vos libertará.",
      reference: "João 8:32"
    },
    {
      text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
      reference: "João 3:16"
    },
    {
      text: "O Senhor é a minha luz e a minha salvação; a quem temerei? O Senhor é a força da minha vida; de quem me recearei?",
      reference: "Salmos 27:1"
    },
    {
      text: "Entrega o teu caminho ao Senhor; confia nele, e ele o fará.",
      reference: "Salmos 37:5"
    },
    {
      text: "Porque o salário do pecado é a morte, mas o dom gratuito de Deus é a vida eterna, por Cristo Jesus nosso Senhor.",
      reference: "Romanos 6:23"
    },
    {
      text: "E aquele que estava assentado sobre o trono disse: Eis que faço novas todas as coisas.",
      reference: "Apocalipse 21:5"
    },
    {
      text: "Porque a minha graça te basta, e o meu poder se aperfeiçoa na fraqueza.",
      reference: "2 Coríntios 12:9"
    },
    {
      text: "Os jovens se cansarão e se fatigarão, e os escolhidos cairão, mas os que esperam no Senhor renovarão as suas forças.",
      reference: "Isaías 40:30-31"
    },
    {
      text: "Seja a vossa palavra: Sim, sim; Não, não; porque o que passa disto é de procedência maligna.",
      reference: "Mateus 5:37"
    },
    {
      text: "Bem-aventurados os que têm fome e sede de justiça, porque eles serão fartos.",
      reference: "Mateus 5:6"
    },
    {
      text: "Porque o Senhor não rejeitará para sempre. Mas, havendo entristecido, também se compadecerá segundo a multidão das suas misericórdias.",
      reference: "Lamentações 3:31-32"
    },
    {
      text: "Grandes coisas fez o Senhor por nós, pelas quais estamos alegres.",
      reference: "Salmos 126:3"
    },
    {
      text: "O Senhor é bom, uma fortaleza no dia da angústia; e conhece os que confiam nele.",
      reference: "Naum 1:7"
    },
    {
      text: "Aquietai-vos e sabei que eu sou Deus; serei exaltado entre os gentios; serei exaltado sobre a terra.",
      reference: "Salmos 46:10"
    },
    {
      text: "Porque os meus pensamentos não são os vossos pensamentos, nem os vossos caminhos os meus caminhos, diz o Senhor.",
      reference: "Isaías 55:8"
    },
    {
      text: "Alegrai-vos sempre no Senhor; outra vez digo, alegrai-vos.",
      reference: "Filipenses 4:4"
    },
    {
      text: "E esta é a confiança que temos nele, que, se pedirmos alguma coisa, segundo a sua vontade, ele nos ouve.",
      reference: "1 João 5:14"
    },
    {
      text: "Porque somos feitura sua, criados em Cristo Jesus para as boas obras, as quais Deus preparou para que andássemos nelas.",
      reference: "Efésios 2:10"
    },
    {
      text: "Mas Deus prova o seu amor para conosco, em que Cristo morreu por nós, sendo nós ainda pecadores.",
      reference: "Romanos 5:8"
    },
    {
      text: "E disse-lhes: Ide por todo o mundo, pregai o evangelho a toda criatura.",
      reference: "Marcos 16:15"
    },
    {
      text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
      reference: "Mateus 11:28"
    }
  ];

  // Função para obter o versículo do dia baseado na data atual
  const getDailyVerse = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    return verses[dayOfYear % verses.length];
  };

  const todaysVerse = getDailyVerse();

  return (
    <section className="py-12 bg-gradient-to-br from-accent/30 to-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg border-primary/20 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mr-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-playfair font-bold text-foreground">Versículo do Dia</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="relative">
              <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/30" />
              <blockquote className="text-lg lg:text-xl text-foreground font-medium italic mb-4 px-6">
                "{todaysVerse.text}"
              </blockquote>
              <cite className="text-base text-primary font-semibold">
                {todaysVerse.reference}
              </cite>
              <Quote className="absolute -bottom-2 -right-2 w-8 h-8 text-primary/30 rotate-180" />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DailyVerse;