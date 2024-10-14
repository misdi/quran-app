'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import QuranContent from '@/components/QuranContent';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FontSettings } from '@/components/FontSettings';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Settings } from 'lucide-react';

export default function Home() {
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [arabicFont, setArabicFont] = useState('Scheherazade');
  const [textFont, setTextFont] = useState('Inter');
  const [fontSize, setFontSize] = useState('medium');

  return (
    <div
      className="flex h-screen bg-background"
      style={{ fontFamily: textFont }}
    >
      <Sidebar onSurahSelect={setSelectedSurah} />
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quran App Beta 1</h1>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-[1.2rem] w-[1.2rem]" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <FontSettings
                  arabicFont={arabicFont}
                  textFont={textFont}
                  fontSize={fontSize}
                  onArabicFontChange={setArabicFont}
                  onTextFontChange={setTextFont}
                  onFontSizeChange={setFontSize}
                />
              </PopoverContent>
            </Popover>
            <ThemeToggle />
          </div>
        </header>
        <QuranContent
          surahId={selectedSurah}
          arabicFont={arabicFont}
          textFont={textFont}
          fontSize={fontSize}
        />
      </div>
    </div>
  );
}
