"use client"

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Book, Layers, FileText } from 'lucide-react';
import { Input } from "@/components/ui/input"

interface Surah {
  id: number;
  name_simple: string;
  name_arabic: string;
}

interface SidebarProps {
  onSurahSelect: (surahId: number) => void;
}

export default function Sidebar({ onSurahSelect }: SidebarProps) {
  const [activeTab, setActiveTab] = useState('surah');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('https://api.quran.com/api/v4/chapters?language=en')
      .then(response => response.json())
      .then(data => setSurahs(data.chapters))
      .catch(error => console.error('Error fetching Surahs:', error));
  }, []);

  const juzList = Array.from({ length: 30 }, (_, i) => i + 1);
  const pageList = Array.from({ length: 604 }, (_, i) => i + 1);

  const filteredSurahs = surahs.filter(surah => 
    surah.name_simple.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.name_arabic.includes(searchTerm)
  );

  return (
    <div className="w-80 h-full border-r border-border bg-card">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="surah"><Book className="w-4 h-4 mr-2" />Surah</TabsTrigger>
          <TabsTrigger value="juz"><Layers className="w-4 h-4 mr-2" />Juz</TabsTrigger>
          <TabsTrigger value="page"><FileText className="w-4 h-4 mr-2" />Page</TabsTrigger>
        </TabsList>
        <div className="p-4">
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
        </div>
        <TabsContent value="surah">
          <ScrollArea className="h-[calc(100vh-180px)] px-4">
            {filteredSurahs.map((surah) => (
              <Button 
                key={surah.id} 
                variant="ghost" 
                className="w-full justify-start mb-2 text-left hover:bg-accent hover:text-accent-foreground"
                onClick={() => onSurahSelect(surah.id)}
              >
                <span className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full mr-3 text-sm">
                  {surah.id}
                </span>
                <div>
                  <div className="font-medium">{surah.name_simple}</div>
                  <div className="text-sm text-muted-foreground">{surah.name_arabic}</div>
                </div>
              </Button>
            ))}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="juz">
          <ScrollArea className="h-[calc(100vh-180px)] px-4">
            {juzList.map((juz) => (
              <Button key={juz} variant="ghost" className="w-full justify-start mb-2 hover:bg-accent hover:text-accent-foreground">
                <span className="w-8 h-8 flex items-center justify-center bg-secondary text-secondary-foreground rounded-full mr-3">
                  {juz}
                </span>
                Juz {juz}
              </Button>
            ))}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="page">
          <ScrollArea className="h-[calc(100vh-180px)] px-4">
            {pageList.map((page) => (
              <Button key={page} variant="ghost" className="w-full justify-start mb-2 hover:bg-accent hover:text-accent-foreground">
                <span className="w-8 h-8 flex items-center justify-center bg-accent text-accent-foreground rounded-full mr-3">
                  {page}
                </span>
                Page {page}
              </Button>
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}