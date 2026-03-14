import { useState } from "react";
import { useAnalyzeLog } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bug, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LogAnalyzer() {
  const [log, setLog] = useState("");
  const analyzeMutation = useAnalyzeLog();

  const handleAnalyze = () => {
    if (!log.trim()) return;
    analyzeMutation.mutate({ data: { log } });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Crash Log Analyzer</h1>
        <p className="text-muted-foreground mt-1">Paste your latest.log or crash-report to instantly find the root cause.</p>
      </div>

      <Card className="border-border shadow-xl">
        <CardContent className="p-0 relative">
          <textarea
            className="w-full h-[300px] bg-[#0c0c0e] text-red-300 font-mono text-sm p-6 focus:outline-none resize-none rounded-t-2xl"
            placeholder="Paste your crash log here..."
            value={log}
            onChange={e => setLog(e.target.value)}
            spellCheck={false}
          />
          <div className="p-4 bg-card border-t border-border flex justify-end rounded-b-2xl">
            <Button size="lg" onClick={handleAnalyze} disabled={!log.trim() || analyzeMutation.isPending} className="gap-2 shadow-lg shadow-primary/20">
              {analyzeMutation.isPending ? <Sparkles className="w-5 h-5 animate-spin" /> : <Bug className="w-5 h-5" />}
              {analyzeMutation.isPending ? "Analyzing..." : "Analyze Log"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {analyzeMutation.isSuccess && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-primary/5 border border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" /> AI Analysis Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none prose-p:leading-relaxed text-foreground">
                {analyzeMutation.data.message.split('\n').map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
