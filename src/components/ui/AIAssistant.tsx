'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "ai",
      content: "Hi! I'm your AI investment analyst. I can help you build formulas, analyze data, or generate insights. What would you like to work on?",
      timestamp: new Date(),
      suggestions: [
        "Calculate IRR for TechFlow Solutions",
        "Build a valuation model",
        "Analyze portfolio performance trends"
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const demoMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

  const demoResponses = {
    "Calculate IRR for TechFlow Solutions": "I'll help you calculate the IRR for TechFlow Solutions. Based on the cash flow data, the IRR is approximately 18.4%. Here's the formula: =IRR([-1000000, 150000, 200000, 300000, 500000], 0.1). Would you like me to create a detailed analysis?",
    "Build a valuation model": "I can help you build a DCF valuation model. Here's a template: =NPV(discount_rate, cash_flows) + terminal_value. For TechFlow Solutions, I estimate a value of $78M using a 15% discount rate. Should I show you the detailed calculations?",
    "Analyze portfolio performance trends": "Your portfolio shows strong performance trends! The average IRR is 18.4% with a 12.5% increase in total value. Top performers include TechFlow Solutions (+20%) and GreenEnergy Corp (+8.2%). Would you like a detailed breakdown?",
    "default": "I'll help you with that. Here's a formula for IRR calculation: =IRR(cashflows_range, [guess]). Would you like me to create a template?"
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user", 
      content: input,
      timestamp: new Date()
    };
    
    setMessages([...messages, newMessage]);
    setInput("");
    
    // Simulate AI response with demo-specific responses
    setTimeout(() => {
      let response = demoResponses.default;
      
      // Check for specific demo responses
      for (const [key, value] of Object.entries(demoResponses)) {
        if (input.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(input.toLowerCase())) {
          response = value;
          break;
        }
      }

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response,
        timestamp: new Date(),
        suggestions: ["Create detailed report", "Show calculations", "Export to Excel"]
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    // Auto-send the suggestion
    setTimeout(() => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "user", 
        content: suggestion,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Simulate AI response
      setTimeout(() => {
        const response = demoResponses[suggestion as keyof typeof demoResponses] || demoResponses.default;
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: response,
          timestamp: new Date(),
          suggestions: ["Create detailed report", "Show calculations", "Export to Excel"]
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }, 100);
  };

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Assistant
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            {isDemoMode ? "Demo Mode" : "Active"}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4">
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                }`}>
                  <p className="text-sm">{message.content}</p>
                  {message.suggestions && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.suggestions.map((suggestion, i) => (
                        <Button 
                          key={i} 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex gap-2">
          <Input 
            placeholder={isDemoMode ? "Ask me about portfolio analysis..." : "Ask me anything about your portfolio..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 