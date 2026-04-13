import React from "react";
import { 
  BookOpen, 
  Monitor, 
  Atom, 
  Palette, 
  Calculator, 
  Globe, 
  Music, 
  FlaskConical, 
  Dumbbell, 
  Trophy 
} from "lucide-react";

export const ICONS = { 
  BookOpen, 
  Monitor, 
  Atom, 
  Palette, 
  Calculator, 
  Globe, 
  Music, 
  FlaskConical, 
  Dumbbell, 
  Trophy 
};

export const AVAILABLE_ICONS = Object.keys(ICONS);

export function ClassIcon({ name, className }) {
  const Icon = ICONS[name] || BookOpen;
  return <Icon className={className} />;
}
