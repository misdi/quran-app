"use client"

import { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Play, Pause } from 'lucide-react';

interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  transliteration: { text: string };
  translations: { text: string }[];
}

interface QuranContentProps {
  surahId: number;
  arabicFont: string;
  textFont: string;
  fontSize: string;
}

export default function QuranContent({ surahId, arabicFont, textFont, fontSize }: QuranContentProps) {
  const [surah, setSurah] = useState<any>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [translation, setTranslation] = useState('131');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentVerse, setCurrentVerse] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`https://api.quran.com/api/v4/chapters/${surahId}?language=en`)
      .then(response => response.json())
      .then(data => setSurah(data.chapter))
      .catch(error => console.error('Error fetching Surah:', error));

    fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahId}?language=en&words=true&translations=${translation}&fields=text_uthmani,verse_key&word_fields=text_uthmani,transliteration`)
      .then(response => response.json())
      .then(data => {
        const processedVerses = data.verses.map((verse: any) => ({
          ...verse,
          transliteration: {
            text: verse.words.map((word: any) => word.transliteration.text).join(' ')
          }
        }));
        setVerses(processedVerses);
      })
      .catch(error => console.error('Error fetching verses:', error));

    fetch(`https://api.quran.com/api/v4/chapter_recitations/1/${surahId}`)
      .then(response => response.json())
      .then(data => setAudioUrl(data.audio_file.audio_url))
      .catch(error => console.error('Error fetching audio URL:', error));
  }, [surahId, translation]);

  const toggleAudio = (verseNumber: number) => {
    if (!audioUrl) return;

    if (currentAudio) {
      currentAudio.pause();
      if (currentVerse === verseNumber) {
        setIsPlaying(false);
        setCurrentVerse(null);
        setCurrentAudio(null);
        return;
      }
    }

    const audio = new Audio(audioUrl);
    const startTime = (verseNumber - 1) * 5; // Approximate start time, adjust as needed
    audio.currentTime = startTime;

    audio.play();
    setIsPlaying(true);
    setCurrentVerse(verseNumber);
    setCurrentAudio(audio);

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentVerse(null);
      setCurrentAudio(null);
    };
  };

  const getFontSize = (size: string) => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const renderTranslation = (text: string) => {
    const regex = /<sup foot_note=\d+>(\d+)<\/sup>/g;
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <sup key={index} className="text-xs text-primary">{part}</sup>;
      }
      return part;
    });
  };

  return (
    <div className="flex-1 p-6 bg-background text-foreground">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{surah ? `${surah.name_arabic} - ${surah.name_simple}` : 'Loading...'}</h1>
        <div className="flex items-center space-x-4">
          <Select value={translation} onValueChange={setTranslation}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select translation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="131">English - Sahih International</SelectItem>
              <SelectItem value="33">Indonesian - Kementerian Agama</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-120px)]">
        {surah && verses.length > 0 ? (
          <div className="space-y-6">
            <p className={`${getFontSize(fontSize)} mb-4`}>{surah.translated_name.name}</p>
            {verses.map((verse) => (
              <div key={verse.id} className="border-b border-border pb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-muted-foreground">[{verse.verse_key}]</p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleAudio(parseInt(verse.verse_key.split(':')[1]))}
                    disabled={!audioUrl}
                  >
                    {currentVerse === parseInt(verse.verse_key.split(':')[1]) && isPlaying ? (
                      <Pause className="w-4 h-4 mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {currentVerse === parseInt(verse.verse_key.split(':')[1]) && isPlaying ? 'Pause' : 'Play Verse'}
                  </Button>
                </div>
                <p className={`text-xl mb-2 text-right ${getFontSize(fontSize)}`} dir="rtl" style={{ fontFamily: arabicFont }}>{verse.text_uthmani}</p>
                <p className={`mb-2 italic ${getFontSize(fontSize)}`} style={{ fontFamily: textFont }}>{verse.transliteration.text}</p>
                <p className={`${getFontSize(fontSize)}`} style={{ fontFamily: textFont }}>{renderTranslation(verse.translations[0].text)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Loading Surah content...</p>
        )}
      </ScrollArea>
    </div>
  );
}