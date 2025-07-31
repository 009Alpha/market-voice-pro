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
      
      // Enhanced settings for better regional language support
      recognition.maxAlternatives = 3;
      recognition.serviceURI = '';

      recognition.onstart = () => {
        console.log(`Speech recognition started for language: ${selectedLanguage}`);
      };

      recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        
        console.log(`Recognized speech (${selectedLanguage}):`, transcript);
        
        if (event.results[last].isFinal) {
          handleVoiceInput(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Recognition Error", 
          description: `Unable to process voice input in ${getLanguageName(selectedLanguage)}. Please try again.`,
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
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
      
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': 'AIzaSyDijmdgLpeFPhfdgoBF01FuHXFF5QMMRgY',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are Stockest, a ${getLanguageName(selectedLanguage)} voice assistant for stock market information. 

STRICT LANGUAGE RULES:
- Write EVERYTHING in ${getLanguageName(selectedLanguage)} script only
- NO English words allowed (avoid: stock, share, market, company, etc.)
- Use native ${getLanguageName(selectedLanguage)} financial terms only
- For example: Use "शेअर्स" not "stocks", "बाजार" not "market", "कंपनी" not "company"

User asked: "${transcript}"

Respond in pure ${getLanguageName(selectedLanguage)} language with stock market information. Keep it conversational and informative. If not stock-related, redirect to stock topics in ${getLanguageName(selectedLanguage)}.`
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
      
      // Wait for voices to be loaded
      const speak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Get available voices and try to find the best match for the language
        const voices = speechSynthesis.getVoices();
        const languageVoice = voices.find(voice => 
          voice.lang.startsWith(selectedLanguage.split('-')[0]) || 
          voice.lang === selectedLanguage
        );
        
        if (languageVoice) {
          utterance.voice = languageVoice;
          console.log(`Using voice: ${languageVoice.name} for ${selectedLanguage}`);
        }
        
        utterance.rate = 0.7; // Slower for better pronunciation
        utterance.pitch = 1;
        utterance.volume = 0.9;
        utterance.lang = selectedLanguage;
        
        utterance.onstart = () => {
          console.log(`Speaking in ${getLanguageName(selectedLanguage)}:`, text);
        };
        
        utterance.onend = () => {
          setIsSpeaking(false);
          console.log('Speech synthesis ended');
        };
        
        utterance.onerror = (event) => {
          setIsSpeaking(false);
          console.error('Speech synthesis error:', event);
        };
        
        speechSynthesis.speak(utterance);
      };
      
      // Check if voices are already loaded
      if (speechSynthesis.getVoices().length > 0) {
        speak();
      } else {
        // Wait for voices to load
        speechSynthesis.onvoiceschanged = () => {
          speak();
        };
      }
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
            {selectedLanguage === 'mr-IN' ? (
              <>
                <div className="p-2 bg-secondary/50 rounded-lg text-center">
                  "रिलायन्सचा आजचा भाव काय आहे?"
                </div>
                <div className="p-2 bg-secondary/50 rounded-lg text-center">
                  "निफ्टी ५० बद्दल सांगा"
                </div>
                <div className="p-2 bg-secondary/50 rounded-lg text-center">
                  "आजचे बाजार रुझान"
                </div>
                <div className="p-2 bg-secondary/50 rounded-lg text-center">
                  "चांगले शेअर्स कोणते आहेत?"
                </div>
              </>
            ) : selectedLanguage === 'hi-IN' ? (
              <>
                <div className="p-2 bg-secondary/50 rounded-lg text-center">
                  "रिलायंस का आज का भाव क्या है?"
                </div>
                <div className="p-2 bg-secondary/50 rounded-lg text-center">
                  "निफ्टी ५० के बारे में बताएं"
                </div>
                <div className="p-2 bg-secondary/50 rounded-lg text-center">
                  "आज के बाजार का रुझान"
                </div>
                <div className="p-2 bg-secondary/50 rounded-lg text-center">
                  "अच्छे शेयर कौन से हैं?"
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};