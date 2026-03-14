import { useState, useRef, useEffect } from "react";
import { useAiChat } from "@workspace/api-client-react";
import type { ChatMessage } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send, User } from "lucide-react";
import { motion } from "framer-motion";

export default function AiAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: "assistant",
    content: "Hello! I'm MinePilot AI. I can help you configure plugins, fix server errors, or optimize performance. What do you need help with?"
  }]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatMutation = useAiChat({
    mutation: {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
      }
    }
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const newMsgs = [...messages, { role: "user" as const, content: input }];
    setMessages(newMsgs);
    setInput("");
    chatMutation.mutate({ data: { messages: newMsgs } });
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-[calc(100vh-6rem)] flex flex-col max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-xl"><Bot className="w-6 h-6" /></div>
          MinePilot AI
        </h1>
        <p className="text-muted-foreground mt-2">Your expert server management co-pilot.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-primary/10 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-secondary text-foreground' : 'bg-gradient-to-br from-primary to-emerald-500 text-white shadow-lg shadow-primary/30'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                msg.role === 'user' ? 'bg-secondary text-foreground rounded-tr-sm' : 'bg-primary/10 text-foreground border border-primary/20 rounded-tl-sm'
              }`}>
                <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-500 text-white flex items-center justify-center shadow-lg"><Bot className="w-5 h-5" /></div>
               <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                 <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                 <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                 <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
               </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 bg-card/80 backdrop-blur-md border-t border-border">
          <form onSubmit={handleSend} className="relative flex items-center">
            <Input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me how to optimize performance or configure LuckPerms..." 
              className="pr-14 h-14 text-base rounded-2xl bg-background/50 border-border focus-visible:ring-primary focus-visible:border-primary shadow-inner"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || chatMutation.isPending} className="absolute right-2 h-10 w-10 rounded-xl shadow-lg">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </motion.div>
  );
}
