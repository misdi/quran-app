"use client"

import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';

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
  const [currentVerse, setCurrentVerse] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<(HTMLDivElement | null)[]>([]);

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
        verseRefs.current = processedVerses.map(() => null);
      })
      .catch(error => console.error('Error fetching verses:', error));

    fetch(`https://api.quran.com/api/v4/chapter_recitations/1/${surahId}`)
      .then(response => response.json())
      .then(data => setAudioUrl(data.audio_file.audio_url))
      .catch(error => console.error('Error fetching audio URL:', error));
  }, [surahId, translation]);

  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.addEventListener('ended', handleAudioEnded);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleAudioEnded);
        audioRef.current.pause();
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (currentVerse !== null) {
      scrollToVerse(currentVerse);
    }
  }, [currentVerse]);

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentVerse(null);
  };

  const togglePlayAll = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      setCurrentVerse(1);
    }
  };

  const playVerse = (verseNumber: number) => {
    if (!audioRef.current) return;

    const startTime = (verseNumber - 1) * 5; // Approximate start time, adjust as needed
    audioRef.current.currentTime = startTime;
    audioRef.current.play();
    setIsPlaying(true);
    setCurrentVerse(verseNumber);
  };

  const nextVerse = () => {
    if (currentVerse && currentVerse < verses.length) {
      playVerse(currentVerse + 1);
    }
  };

  const previousVerse = () => {
    if (currentVerse && currentVerse > 1) {
      playVerse(currentVerse - 1);
    }
  };

  const scrollToVerse = (verseNumber: number) => {
    const verseElement = verseRefs.current[verseNumber - 1];
    if (verseElement && scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      const verseTop = verseElement.offsetTop;
      const scrollAreaHeight = scrollArea.clientHeight;
      const scrollTop = verseTop - scrollAreaHeight / 2 + verseElement.clientHeight / 2;
      
      scrollArea.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
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
    <div className="flex-1 flex flex-col h-full bg-background text-foreground">
      <div className="p-6 border-b border-border">
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
        {surah && <p className={`${getFontSize(fontSize)}`}>{surah.translated_name.name}</p>}
        <div className="flex items-center space-x-2 mt-4">
          <Button onClick={togglePlayAll} disabled={!audioUrl}>
            {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isPlaying ? 'Pause Surah' : 'Play Surah'}
          </Button>
          <Button onClick={previousVerse} disabled={!isPlaying || currentVerse === 1}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button onClick={nextVerse} disabled={!isPlaying || currentVerse === verses.length}>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        {verses.length > 0 ? (
          <div className="space-y-6">
            {verses.map((verse, index) => {
              const verseNumber = parseInt(verse.verse_key.split(':')[1]);
              return (
                <div 
                  key={verse.id} 
                  className={`border-b border-border pb-4 ${currentVerse === verseNumber ? 'bg-accent/10 rounded-lg p-4' : ''}`}
                  ref={el => verseRefs.current[index] = el}
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground">[{verse.verse_key}]</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => playVerse(verseNumber)}
                      disabled={!audioUrl}
                    >
                      {currentVerse === verseNumber && isPlaying ? (
                        <Pause className="w-4 h-4 mr-2" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {currentVerse === verseNumber && isPlaying ? 'Pause' : 'Play Verse'}
                    </Button>
                  </div>
                  <p className={`text-2xl mb-2 text-right leading-loose ${getFontSize(fontSize)}`} dir="rtl" style={{ fontFamily: arabicFont }}>{verse.text_uthmani}</p>
                  <p className={`mb-2 italic ${getFontSize(fontSize)}`} style={{ fontFamily: textFont }}>{verse.transliteration.text}</p>
                  <p className={`${getFontSize(fontSize)}`} style={{ fontFamily: textFont }}>{renderTranslation(verse.translations[0].text)}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p>Loading Surah content...</p>
        )}
      </ScrollArea>
    </div>
  );
}