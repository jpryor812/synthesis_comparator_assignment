import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowRight, Volume2, VolumeX } from 'lucide-react';

interface TutorialInstructionsProps {
  onComplete: () => void;
}

const TutorialInstructions: React.FC<TutorialInstructionsProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speech, setSpeech] = useState<SpeechSynthesisUtterance | null>(null);

  const instructions = [
    {
      text: "Welcome! Let's learn how to compare numbers using these interactive blocks.",
      position: "center"
    },
    {
      text: "On each side, you can use the number pad to add or remove blocks.",
      position: "bottom-sides",
      showArrows: true,
      arrowPositions: [
        { x: 15, y: 50 },
        { x: 85, y: 50 }
      ]
    },
    {
      text: "Watch the comparison signs in the middle - they'll show if the left side is less than (<), equal to (=), or greater than (>) the right side.",
      position: "center"
    },
    {
      text: "You can also toggle between 'Show Lines' and 'Draw Lines' at the bottom to practice drawing comparison lines yourself!",
      position: "bottom-center"
    }
  ];

  // Initialize speech synthesis with preferred voice
  const initializeSpeech = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower than default
    utterance.pitch = 1.2; // Slightly higher pitch
    
    // Try to find a female voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.includes('female') || 
      voice.name.includes('Samantha') || // Common female voice on macOS
      voice.name.includes('Microsoft Zira') // Common female voice on Windows
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    return utterance;
  };

  // Initial setup effect
  useEffect(() => {
    // Wait for voices to be loaded
    const handleVoicesChanged = () => {
      const initialUtterance = initializeSpeech(instructions[0].text);
      setSpeech(initialUtterance);
      
      if (!isMuted) {
        window.speechSynthesis.speak(initialUtterance);
      }
    };

    // Chrome needs this event listener, other browsers may already have voices loaded
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    
    // Try immediate initialization in case voices are already loaded
    if (window.speechSynthesis.getVoices().length > 0) {
      handleVoicesChanged();
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []); // Empty dependency array for initial mount only

  // Handle step changes
  useEffect(() => {
    if (currentStep > 0) { // Skip for initial render since it's handled in mount effect
      const utterance = initializeSpeech(instructions[currentStep].text);
      setSpeech(utterance);

      if (!isMuted) {
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        window.speechSynthesis.speak(utterance);
      }
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentStep, isMuted]);

  const handleNext = () => {
    window.speechSynthesis.cancel();
    
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const toggleMute = () => {
    if (!isMuted) {
      window.speechSynthesis.cancel();
    } else if (speech) {
      window.speechSynthesis.speak(speech);
    }
    setIsMuted(!isMuted);
  };

  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'bottom-sides':
        return 'top-1/3 left-1/2 -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-24 left-1/2 -translate-x-1/2';
      case 'center':
      default:
        return 'top-1/3 left-1/2 -translate-x-1/2';
    }
  };

  const currentInstruction = instructions[currentStep];

  return (
    <div className="absolute inset-0 bg-black/20 z-50">
      <div 
        className={`absolute bg-white rounded-lg p-6 shadow-lg max-w-md pointer-events-auto
          ${getPositionClasses(currentInstruction.position)}`}
      >
        <button
          onClick={toggleMute}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={isMuted ? "Unmute voice" : "Mute voice"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-gray-500" />
          ) : (
            <Volume2 className="w-5 h-5 text-blue-500" />
          )}
        </button>

        <p className="text-gray-800 text-lg mb-4">{currentInstruction.text}</p>
        <button
          onClick={handleNext}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors w-full"
        >
          {currentStep < instructions.length - 1 ? (
            <>
              Continue <ChevronRight className="ml-2 w-4 h-4" />
            </>
          ) : (
            'Start Playing!'
          )}
        </button>
      </div>

      {currentInstruction.showArrows && currentInstruction.arrowPositions?.map((pos, index) => (
        <div 
          key={index}
          className="absolute pointer-events-none"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`
          }}
        >
          <ArrowRight className="w-8 h-8 text-blue-500 animate-bounce" />
        </div>
      ))}
    </div>
  );
};

export default TutorialInstructions;