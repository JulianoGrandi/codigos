import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { 
  User, ArrowLeft, MessageCircle, Gift, Lightbulb,
  Target, Heart, AlertTriangle, CheckCircle, Star
} from 'lucide-react';
import LCARSPanel from './LCARSPanel';

const TYPE_COLORS = {
  instrutor: "red",
  colega: "orange",
  amigo: "blue"
};

const DIALOGUES = {
  // Comandante T'Vok - Instrutor Severo
  "tvok_greeting_neutral": {
    text: "Cadete. Você está atrasado para seus estudos. A mediocridade é uma escolha, e parece que você a fez.",
    responses: [
      { text: "Peço desculpas, Comandante. Não acontecerá novamente.", relationshipChange: 5, nextDialogue: "tvok_apology" },
      { text: "Na verdade, estava revisando táticas avançadas por conta própria.", relationshipChange: -5, nextDialogue: "tvok_excuse" },
      { text: "Com todo respeito, estava ajudando um colega em dificuldades.", relationshipChange: 10, nextDialogue: "tvok_helping" }
    ]
  },
  "tvok_apology": {
    text: "Desculpas são irrelevantes. Resultados são tudo que importa. Você tem potencial, mas potencial desperdiçado é pior que nenhum potencial.",
    responses: [
      { text: "O que posso fazer para melhorar, Comandante?", relationshipChange: 10, givesAdvice: "A disciplina é a base de todo oficial. Pratique simulações táticas diariamente." },
      { text: "Entendido. Vou me esforçar mais.", relationshipChange: 5 }
    ]
  },
  "tvok_excuse": {
    text: "*Levanta uma sobrancelha* Estudos independentes? Sem supervisão apropriada, você apenas reforça seus próprios erros. Fascinante arrogância.",
    responses: [
      { text: "Tem razão. Aceito sua orientação.", relationshipChange: 5 },
      { text: "Meus resultados falam por si mesmos.", relationshipChange: -10 }
    ]
  },
  "tvok_helping": {
    text: "*Pausa* Ajudar colegas é... admirável. Os Vulcanos valorizam o bem coletivo. Talvez eu tenha julgado precipitadamente. Ilógico da minha parte.",
    responses: [
      { text: "Obrigado por entender, Comandante.", relationshipChange: 15, givesAdvice: "Liderança não é apenas dar ordens. É elevar aqueles ao seu redor." },
      { text: "Poderia me ajudar com uma simulação avançada?", givesMission: "tvok_tactical_sim", relationshipChange: 5 }
    ]
  },
  "tvok_friendly": {
    text: "Cadete. Tenho observado seu progresso. Sua lógica em situações de crise tem melhorado. Há uma simulação classificada que acredito que você está pronto para enfrentar.",
    responses: [
      { text: "Estou honrado com sua confiança, Comandante.", relationshipChange: 10, givesMission: "tvok_classified_sim" },
      { text: "Quais são os parâmetros da simulação?", relationshipChange: 5, givesAdvice: "Uma simulação de invasão Borg. Poucos sobrevivem mentalmente intactos." }
    ]
  },

  // Cadet Korvax - Rival
  "korvax_greeting_neutral": {
    text: "*Olha você de cima a baixo* Ah, você. Ouvi dizer que passou na simulação básica. Impressionante... para os padrões humanos.",
    responses: [
      { text: "Parabéns pelo seu desempenho também, Korvax.", relationshipChange: 10, nextDialogue: "korvax_surprised" },
      { text: "Meus 'padrões humanos' superaram suas notas em xenobiologia.", relationshipChange: -15, nextDialogue: "korvax_angry" },
      { text: "Que tal uma competição amigável para resolver isso?", relationshipChange: 5, nextDialogue: "korvax_challenge" }
    ]
  },
  "korvax_surprised": {
    text: "*Hesita* Você... não vai revidar? Interessante. A maioria dos humanos é mais... volátil. Talvez eu tenha subestimado você.",
    responses: [
      { text: "Somos futuros oficiais. Devemos trabalhar juntos.", relationshipChange: 15, givesAdvice: "Klingons respeitam honra, não arrogância. Lembre-se disso." },
      { text: "Não tenho nada a provar para você.", relationshipChange: -5 }
    ]
  },
  "korvax_angry": {
    text: "*Rosna* Uma disciplina não define um guerreiro! Encontre-me no holodeck às 0600. Veremos quem é superior em combate!",
    responses: [
      { text: "Aceito seu desafio.", givesMission: "korvax_duel", relationshipChange: -5 },
      { text: "Violência não prova nada. Recuso.", relationshipChange: 10 }
    ]
  },
  "korvax_challenge": {
    text: "*Sorri* Uma competição? Agora você fala minha língua! Corrida de obstáculos, amanhã. O perdedor compra raktajino por uma semana.",
    responses: [
      { text: "Fechado. Prepare seu crédito.", givesMission: "korvax_race", relationshipChange: 10 },
      { text: "Prefiro uma competição acadêmica.", relationshipChange: -5 }
    ]
  },
  "korvax_friendly": {
    text: "Ei, humano... não, espera. *Nome do cadete*. Preciso de ajuda. Meu irmão está em problemas na fronteira. Você é o único que confio aqui. Patético, não?",
    responses: [
      { text: "Conte comigo, Korvax. O que aconteceu?", givesMission: "korvax_brother", relationshipChange: 20 },
      { text: "Confiar em mim? O grande Korvax admitindo fraqueza?", relationshipChange: -10 }
    ]
  },

  // Ensign Zara - Amiga Leal
  "zara_greeting_neutral": {
    text: "*Sorri calorosamente* Ei! Você é o novo cadete, certo? Sou Zara! Vi você nas simulações - você foi INCRÍVEL! Quer estudar juntos mais tarde?",
    responses: [
      { text: "Claro! Seria ótimo ter companhia.", relationshipChange: 15, nextDialogue: "zara_happy" },
      { text: "Obrigado, mas prefiro estudar sozinho.", relationshipChange: -5, nextDialogue: "zara_sad" },
      { text: "Você também foi bem! Aquela manobra evasiva foi impressionante.", relationshipChange: 20, nextDialogue: "zara_flattered" }
    ]
  },
  "zara_happy": {
    text: "*Pula animada* Eba! Conheço o MELHOR lugar na biblioteca - tem uma vista linda da nebulosa! Ah, e trago biscoitos Bajoranos - minha avó faz os melhores!",
    responses: [
      { text: "Parece perfeito! Mal posso esperar.", relationshipChange: 10, givesAdvice: "Sabia que há um jardim secreto no deck 7? Ótimo para meditar antes dos exames!" },
      { text: "Você é muito gentil, Zara.", relationshipChange: 5 }
    ]
  },
  "zara_sad": {
    text: "*Murcha um pouco* Oh... tudo bem, entendo. Todo mundo tem seu método. Mas se mudar de ideia, minha porta está sempre aberta! Literalmente, o trinco quebrou.",
    responses: [
      { text: "Na verdade... companhia seria bom. Desculpe a frieza.", relationshipChange: 10 },
      { text: "Obrigado pela compreensão.", relationshipChange: 0 }
    ]
  },
  "zara_flattered": {
    text: "*Fica roxa de vergonha* V-você viu?! Eu quase bati na parede! Mas obrigada! Meu pai era piloto, ele me ensinou algumas coisas. Ei, quer que eu te mostre?",
    responses: [
      { text: "Adoraria aprender com você!", givesMission: "zara_piloting", relationshipChange: 15 },
      { text: "Talvez outro dia. Mas continue praticando!", relationshipChange: 5 }
    ]
  },
  "zara_friendly": {
    text: "*Séria pela primeira vez* Ei... posso te contar um segredo? Descobri algo estranho nos arquivos antigos da Academia. Algo sobre um experimento que deu errado. Tenho medo de investigar sozinha.",
    responses: [
      { text: "Vamos investigar juntos. Estou com você.", givesMission: "zara_mystery", relationshipChange: 25 },
      { text: "Isso parece perigoso. Devíamos reportar.", relationshipChange: -5, givesAdvice: "Você tem razão... mas e se eles encobrirem? Preciso pensar mais." }
    ]
  }
};

export default function NPCInteraction({ npc, relationship, cadet, onClose, onUpdateRelationship, onStartMission }) {
  const [currentDialogue, setCurrentDialogue] = useState(null);
  const [showAdvice, setShowAdvice] = useState(null);
  const [showMissionOffer, setShowMissionOffer] = useState(null);
  const [relationshipDelta, setRelationshipDelta] = useState(0);

  const color = TYPE_COLORS[npc.type] || "blue";
  const level = relationship?.level || 0;

  useEffect(() => {
    // Determine initial dialogue based on relationship level
    let dialogueKey;
    if (npc.name === "Comandante T'Vok") {
      dialogueKey = level >= 30 ? "tvok_friendly" : "tvok_greeting_neutral";
    } else if (npc.name === "Cadete Korvax") {
      dialogueKey = level >= 30 ? "korvax_friendly" : "korvax_greeting_neutral";
    } else if (npc.name === "Alferes Zara") {
      dialogueKey = level >= 30 ? "zara_friendly" : "zara_greeting_neutral";
    }
    setCurrentDialogue(DIALOGUES[dialogueKey]);
  }, [npc, level]);

  const handleResponse = (response) => {
    if (response.relationshipChange) {
      setRelationshipDelta(prev => prev + response.relationshipChange);
    }

    if (response.givesAdvice) {
      setShowAdvice(response.givesAdvice);
    }

    if (response.givesMission) {
      setShowMissionOffer(response.givesMission);
    }

    if (response.nextDialogue && DIALOGUES[response.nextDialogue]) {
      setCurrentDialogue(DIALOGUES[response.nextDialogue]);
    } else if (!response.givesAdvice && !response.givesMission) {
      // End conversation
      handleClose();
    }
  };

  const handleClose = () => {
    if (relationshipDelta !== 0) {
      onUpdateRelationship(npc.id, relationshipDelta);
    }
    onClose();
  };

  const handleAcceptMission = () => {
    if (showMissionOffer) {
      onStartMission(showMissionOffer);
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl"
      >
        <LCARSPanel title={`Comunicação: ${npc.name}`} color={color}>
          <div className="space-y-6">
            {/* NPC Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-700">
              <div className={cn(
                "w-20 h-20 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br",
                color === "red" && "from-red-500/20 to-red-600/20 border-2 border-red-400/30",
                color === "orange" && "from-amber-500/20 to-amber-600/20 border-2 border-amber-400/30",
                color === "blue" && "from-cyan-500/20 to-cyan-600/20 border-2 border-cyan-400/30"
              )}>
                <User className={cn(
                  "w-10 h-10",
                  color === "red" && "text-red-400",
                  color === "orange" && "text-amber-400",
                  color === "blue" && "text-cyan-400"
                )} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{npc.name}</h2>
                <p className="text-sm text-slate-400">{npc.title}</p>
                <p className="text-xs text-slate-500">{npc.species}</p>
              </div>
              <div className="ml-auto text-right">
                <div className="flex items-center gap-1 text-sm">
                  <Heart className={cn(
                    "w-4 h-4",
                    relationshipDelta > 0 ? "text-green-400" : 
                    relationshipDelta < 0 ? "text-red-400" : "text-slate-400"
                  )} />
                  <span className={cn(
                    relationshipDelta > 0 ? "text-green-400" : 
                    relationshipDelta < 0 ? "text-red-400" : "text-slate-400"
                  )}>
                    {relationshipDelta > 0 ? `+${relationshipDelta}` : relationshipDelta}
                  </span>
                </div>
              </div>
            </div>

            {/* Advice Display */}
            <AnimatePresence mode="wait">
              {showAdvice && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/30"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-400 mb-1">Conselho Recebido</p>
                      <p className="text-sm text-slate-300">{showAdvice}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowAdvice(null)}
                    className="mt-4 w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Entendido
                  </Button>
                </motion.div>
              )}

              {/* Mission Offer */}
              {showMissionOffer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30"
                >
                  <div className="flex items-start gap-3">
                    <Target className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-cyan-400 mb-1">Missão Oferecida!</p>
                      <p className="text-sm text-slate-300">{npc.name} está oferecendo uma missão especial para você.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => setShowMissionOffer(null)}
                      variant="outline"
                      className="flex-1 border-slate-600"
                    >
                      Recusar
                    </Button>
                    <Button
                      onClick={handleAcceptMission}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600"
                    >
                      <Star className="w-4 h-4 mr-2" /> Aceitar Missão
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Dialogue */}
              {!showAdvice && !showMissionOffer && currentDialogue && (
                <motion.div
                  key={currentDialogue.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="flex items-start gap-3">
                      <MessageCircle className={cn(
                        "w-5 h-5 flex-shrink-0 mt-0.5",
                        color === "red" && "text-red-400",
                        color === "orange" && "text-amber-400",
                        color === "blue" && "text-cyan-400"
                      )} />
                      <p className="text-slate-200 leading-relaxed">{currentDialogue.text}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {currentDialogue.responses?.map((response, idx) => (
                      <Button
                        key={idx}
                        onClick={() => handleResponse(response)}
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left h-auto py-3 px-4",
                          "border-slate-600 hover:border-cyan-400 hover:bg-cyan-500/10",
                          "text-slate-200 hover:text-white"
                        )}
                      >
                        <span>{response.text}</span>
                        {response.relationshipChange && (
                          <span className={cn(
                            "ml-auto text-xs",
                            response.relationshipChange > 0 ? "text-green-400" : "text-red-400"
                          )}>
                            {response.relationshipChange > 0 ? '+' : ''}{response.relationshipChange}
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Close Button */}
            <div className="pt-4 border-t border-slate-700">
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full border-slate-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Encerrar Conversa
              </Button>
            </div>
          </div>
        </LCARSPanel>
      </motion.div>
    </div>
  );
}
