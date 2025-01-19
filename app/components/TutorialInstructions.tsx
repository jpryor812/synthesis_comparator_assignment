import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface TutorialInstructionsProps {
  onComplete: () => void;
}

const TutorialInstructions: React.FC<TutorialInstructionsProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const initialAudioPendingRef = useRef(true);

  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'bottom-sides':
        return 'top-1/3 left-1/2 -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-32 left-1/2 -translate-x-1/2';
      case 'center-low':
        return 'top-[70%] left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2';
    }
  };
  
  const instructions = [
    {
      text: "Click here to get Started!",
      position: "center"
    },
    {
      text: "Today we're going to learn how to compare numbers using these blocks.",
      position: "center-low"
    },
    {
      text: "We're going to use these comparison signs in the middle to show if the number of blocks on the left side is less than (<), equal to (=), or greater than (>) the number of blocks on the right side.",
      position: "center-low"
    },
    {
      text: "On each side, you can use the number pad to add or remove blocks by pressing the plus (+) or minus (-) buttons. Or, you can tap any number to show that many blocks.",
      position: "bottom-sides",
    },
    {
        text: "You can also tap the Add a Block button to add a block, or hold down on the top block in the stack to pop it off the stack.",
        position: "bottom-sides",
      },
    {
      text: "Right now, you can see the lines to help you visualize the comparison. If you'd like, you can tap the Draw Lines button to practice drawing comparison lines yourself!",
      position: "center-low"
    },
    {
        text: "When you're ready for a challenge, you can tap the comparison sign in the middle to see if the blocks on the left side are less than, equal to, or greater than the blocks on the right side! Try whatever numbers you'd like!",
        position: "center-low"
      }
  ];

  const generateSpeech = async (text: string) => {
    try {
      setIsLoading(true);
      
      // Log the API key (first few characters for debugging)
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      console.log('API Key starts with:', apiKey?.substring(0, 5));
      
      if (!apiKey) {
        throw new Error('API key is not defined');
      }

      console.log('Making API request to ElevenLabs...');

      const speechText = text.replace(/\([^)]*\)/g, '');
      
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/XrExE9yKIg1WjnnlVkGX/stream', {  // Sally Sunshine voice ID
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
            text: speechText,  
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
            stability: 0.9,  
            similarity_boost: 0.9,  
            speaking_rate: .95, 
            pitch: 1.1 
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to generate speech: ${response.status} ${response.statusText}`);
      }
      
      console.log('Successfully received audio response');

      const audioBlob = await response.blob();
      
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }

      const url = URL.createObjectURL(audioBlob);
      audioUrlRef.current = url;

      if (audioRef.current) {
        audioRef.current.src = url;
        if (!isMuted && (hasInteracted || !initialAudioPendingRef.current)) {
          try {
            await audioRef.current.play();
          } catch (error) {
            console.log('Auto-play prevented. Waiting for user interaction.');
          }
        }
      }
    } catch (error) {
      console.error('Error generating speech:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateSpeech(instructions[0].text);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentStep > 0) {
      generateSpeech(instructions[currentStep].text);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      initialAudioPendingRef.current = false;
    }
  
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      onComplete();
    }
  };

  const toggleMute = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      initialAudioPendingRef.current = false;
    }
  
    setIsMuted(!isMuted);
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(() => {
          console.log('Playback prevented. Please try again.');
        });
      } else {
        audioRef.current.pause();
      }
    }
  };

  const currentInstruction = instructions[currentStep];

  return (
    <div className="absolute inset-0 bg-black/20 z-50">
      <audio ref={audioRef} />
      {currentInstruction.text.includes("comparison signs") && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 rounded-full border-4 border-blue-500 animate-pulse pointer-events-none" 
             style={{
               boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)',
               transform: 'translate(-50%, -80%)'  
             }}
        />
      )}

      <div 
        className={`absolute bg-white rounded-lg p-6 shadow-lg max-w-md pointer-events-auto
          ${getPositionClasses(currentInstruction.position)}`}
      >
        <button
          onClick={toggleMute}
          className="absolute top-1 right-1 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={isMuted ? "Unmute voice" : "Mute voice"}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin text-center" />
          ) : isMuted ? (
            <VolumeX className="w-5 h-5 text-gray-500 text-center" />
          ) : (
            <Volume2 className="w-5 h-5 text-blue-500 text-center" />
          )}
        </button>

        <p className="text-gray-800 text-lg mb-4 text-center">{currentInstruction.text}</p>
        <button
          onClick={handleNext}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors w-full"
          disabled={isLoading}
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
    </div>
  );
};

export default TutorialInstructions;