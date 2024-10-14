"use client"

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface FontSettingsProps {
  arabicFont: string;
  textFont: string;
  fontSize: string;
  onArabicFontChange: (font: string) => void;
  onTextFontChange: (font: string) => void;
  onFontSizeChange: (size: string) => void;
}

const arabicFonts = [
  { value: 'Scheherazade', label: 'Scheherazade' },
  { value: 'Amiri', label: 'Amiri' },
  { value: 'Lateef', label: 'Lateef' },
];

const textFonts = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Lato', label: 'Lato' },
];

const fontSizes = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export function FontSettings({ 
  arabicFont, 
  textFont, 
  fontSize,
  onArabicFontChange, 
  onTextFontChange,
  onFontSizeChange
}: FontSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="arabic-font">Arabic Font</Label>
        <Select value={arabicFont} onValueChange={onArabicFontChange}>
          <SelectTrigger id="arabic-font">
            <SelectValue placeholder="Select Arabic font" />
          </SelectTrigger>
          <SelectContent>
            {arabicFonts.map((font) => (
              <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="text-font">Text Font</Label>
        <Select value={textFont} onValueChange={onTextFontChange}>
          <SelectTrigger id="text-font">
            <SelectValue placeholder="Select text font" />
          </SelectTrigger>
          <SelectContent>
            {textFonts.map((font) => (
              <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="font-size">Font Size</Label>
        <Select value={fontSize} onValueChange={onFontSizeChange}>
          <SelectTrigger id="font-size">
            <SelectValue placeholder="Select font size" />
          </SelectTrigger>
          <SelectContent>
            {fontSizes.map((size) => (
              <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}