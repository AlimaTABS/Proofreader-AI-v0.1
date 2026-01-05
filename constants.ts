export const TARGET_LANGUAGES = [
  "Arabic", "Armenian", "Bassa", "Bengali", "Chichewa", "Chinese (Simplified)", 
  "Chinese (Traditional Mandarin)", "English", "French", "Georgian", "Haitian Creole", 
  "Hindi", "Hungarian", "Kazakh", "Kinyarwanda", "Kiswahili", "Kannada", "Luganda", 
  "Manipuri", "Mongolian", "Nepali", "Oriya (Odia)", "Polish", "Portuguese", 
  "Punjabi", "Romanian", "Rongmei", "Russian", "Sesotho", "Spanish", "Tagalog", 
  "Tamil", "Telugu", "Thai", "Turkish", "Ukrainian", "Urdu", "Uzbek"
];

export const DEFAULT_SEGMENTS = [
  {
    id: '1',
    sourceText: "The quick brown fox jumps over the lazy dog.",
    targetText: "Le renard brun rapide saute par-dessus le chien paresseux.",
    status: 'Pending',
    category: 'None',
    aiFeedback: null,
    isAnalyzing: false,
  },
  {
    id: '2',
    sourceText: "Please ensure that all safety protocols are followed strictly within the laboratory environment.",
    targetText: "",
    status: 'Pending',
    category: 'None',
    aiFeedback: null,
    isAnalyzing: false,
  }
];