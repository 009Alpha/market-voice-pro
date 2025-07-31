import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const languages = [
  { code: 'en-IN', name: 'English (India)', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'gu-IN', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'mr-IN', name: 'Marathi', flag: '🇮🇳' },
  { code: 'bn-IN', name: 'Bengali', flag: '🇮🇳' },
  { code: 'pa-IN', name: 'Punjabi', flag: '🇮🇳' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
}) => {
  return (
    <Card className="p-4 bg-gradient-secondary border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-3">Language Settings</h3>
      
      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select your preferred language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center space-x-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <p className="text-xs text-muted-foreground mt-2">
        The assistant will respond in your selected language
      </p>
    </Card>
  );
};