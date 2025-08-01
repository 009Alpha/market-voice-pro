import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Add speech recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceAssistantProps {
  onResponse: (response: string) => void;
  onUserQuery: (query: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
  selectedLanguage: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onResponse,
  onUserQuery,
  isListening,
  onToggleListening,
  selectedLanguage,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  // Language mapping for proper names
  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      'en-IN': 'English',
      'hi-IN': 'Hindi',
      'ta-IN': 'Tamil',
      'te-IN': 'Telugu',
      'kn-IN': 'Kannada',
      'ml-IN': 'Malayalam',
      'gu-IN': 'Gujarati',
      'mr-IN': 'Marathi',
      'bn-IN': 'Bengali',
      'pa-IN': 'Punjabi',
    };
    return languages[code] || 'English';
  };

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;

      recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        
        if (event.results[last].isFinal) {
          handleVoiceInput(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Recognition Error",
          description: "Unable to process voice input. Please try again.",
          variant: "destructive",
        });
      };
    } else {
      toast({
        title: "Browser Not Supported",
        description: "Voice recognition is not supported in this browser.",
        variant: "destructive",
      });
    }
  }, [selectedLanguage]);

  const handleVoiceInput = async (transcript: string) => {
    try {
      // Add user query to conversation
      onUserQuery(transcript);
      
      // Fetch real-time stock data first
      let stockContext = "";
      try {
        const stockResponse = await fetch('https://d512f1a1-eb68-4d6e-98c8-3d2819c5eaf4.supabase.co/functions/v1/get-stock-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: transcript,
            language: selectedLanguage,
          }),
        });

        if (stockResponse.ok) {
          const stockData = await stockResponse.json();
          if (stockData.success && stockData.context) {
            stockContext = `\n\nReal-time market data and latest information:\n${stockData.context}`;
          }
        }
      } catch (stockError) {
        console.log('Stock data fetch failed, continuing with general response:', stockError);
      }

      // Generate AI response with real-time context
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': 'AIzaSyDijmdgLpeFPhfdgoBF01FuHXFF5QMMRgY',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are Stockest, a voice assistant specialized in stock market information. Use the following real-time data to answer the user's query accurately. Answer in a conversational manner in ${getLanguageName(selectedLanguage)} language.

User Query: ${transcript}${stockContext}

Instructions:
- Use the real-time data provided above to give accurate, current information
- If real-time data is available, prioritize it over general knowledge
- Include specific prices, percentages, and market movements when available
- Keep responses concise but informative
- Always respond in ${getLanguageName(selectedLanguage)} language only
- If the query is not related to stocks or finance, politely redirect to stock market topics`
            }]
          }],
        }),
      });

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that request.";
      
      onResponse(aiResponse);
      
      if (audioEnabled) {
        speakResponse(aiResponse);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      toast({
        title: "API Error",
        description: "Failed to get response from AI. Please try again.",
        variant: "destructive",
      });
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      utterance.lang = selectedLanguage;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
      onToggleListening();
    }
  };

  const toggleAudio = () => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setAudioEnabled(!audioEnabled);
  };

  return (
    <Card className="p-6 bg-gradient-secondary border-border/50 shadow-card">
      <div className="flex flex-col items-center space-y-6">
        {/* Voice Assistant Avatar */}
        <div className="relative">
          <div className={`w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center transition-all duration-300 ${
            isListening ? 'scale-110 shadow-primary' : 'scale-100'
          } ${isSpeaking ? 'animate-pulse' : ''}`}>
            <div className="w-24 h-24 rounded-full bg-background/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-background/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">S</span>
              </div>
            </div>
          </div>
          
          {/* Listening indicator */}
          {isListening && (
            <div className="absolute inset-0 rounded-full animate-ping bg-primary/30"></div>
          )}
        </div>

        {/* Assistant Status */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">Stockest Assistant</h3>
          <p className="text-muted-foreground">
            {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready for your question'}
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-4">
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="w-16 h-16 rounded-full"
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </Button>
          
          <Button
            onClick={toggleAudio}
            variant={audioEnabled ? "default" : "secondary"}
            size="lg"
            className="w-16 h-16 rounded-full"
          >
            {audioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </Button>
        </div>

        {/* Quick Commands */}
        <div className="w-full">
          <p className="text-sm text-muted-foreground mb-2 text-center">Try asking:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-secondary/50 rounded-lg text-center">
              "What's the current price of Reliance?"
            </div>
            <div className="p-2 bg-secondary/50 rounded-lg text-center">
              "Tell me about NIFTY 50"
            </div>
            <div className="p-2 bg-secondary/50 rounded-lg text-center">
              "Market trends today"
            </div>
            <div className="p-2 bg-secondary/50 rounded-lg text-center">
              "Best stocks to invest"
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};