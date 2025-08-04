import React, { useState } from 'react';
import { StockMarketHeader } from '@/components/StockMarketHeader';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { ConversationHistory } from '@/components/ConversationHistory';
import { LanguageSelector } from '@/components/LanguageSelector';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');

  const handleUserQuery = (query: string) => {
    const userMessage: Message = {
      id: Date.now().toString() + '_user',
      type: 'user',
      content: query,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
  };

  const handleResponse = (response: string) => {
    const newMessage: Message = {
      id: Date.now().toString() + '_assistant',
      type: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <StockMarketHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Voice Assistant - Main Column */}
          <div className="lg:col-span-2">
            <VoiceAssistant
              onResponse={handleResponse}
              onUserQuery={handleUserQuery}
              isListening={isListening}
              onToggleListening={toggleListening}
              selectedLanguage={selectedLanguage}
            />
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
            />
            
            <ConversationHistory messages={messages} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by Google Gemini AI • Real-time Stock Market Data
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
