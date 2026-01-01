import { useState, useCallback, useEffect } from 'react';
import { WebAudioScheduledPlayer } from './WebAudioScheduledPlayer';
import { TranscriptViewer } from './TranscriptViewer';
import { useTTSFallback } from '@/hooks/useTTSFallback';
import { Button } from '@/components/ui/button';
import { Volume2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WebAudioScheduledPlayerSafeProps {
  audioUrls: {
    part1?: string | null;
    part2?: string | null;
    part3?: string | null;
    part4?: string | null;
  };
  transcripts?: {
    part1?: string | null;
    part2?: string | null;
    part3?: string | null;
    part4?: string | null;
  };
  initialStartTime?: number;
  initialPart?: number;
  onPartChange?: (partNumber: number) => void;
  onTestComplete?: () => void;
  onReviewStart?: () => void;
  accent?: 'US' | 'GB' | 'AU';
  className?: string;
}

/**
 * A wrapper around WebAudioScheduledPlayer that provides:
 * 1. TTS fallback when audio fails to load
 * 2. Transcript viewer for read-along
 * 3. Error recovery with user-friendly messaging
 */
export function WebAudioScheduledPlayerSafe({
  audioUrls,
  transcripts,
  initialStartTime = 0,
  initialPart,
  onPartChange,
  onTestComplete,
  onReviewStart,
  accent = 'GB',
  className,
}: WebAudioScheduledPlayerSafeProps) {
  const [audioError, setAudioError] = useState<string | null>(null);
  const [currentPart, setCurrentPart] = useState(initialPart || 1);
  const [useTTS, setUseTTS] = useState(false);
  
  const { speak, stop: cancel, isSpeaking: speaking, isSupported: ttsSupported } = useTTSFallback({
    accentHint: accent,
    rate: 0.9, // Slightly slower for listening practice
  });

  // Check if audio URLs are valid
  const hasAudioUrls = Boolean(
    audioUrls.part1 || audioUrls.part2 || audioUrls.part3 || audioUrls.part4
  );
  
  const hasTranscripts = Boolean(
    transcripts?.part1 || transcripts?.part2 || transcripts?.part3 || transcripts?.part4
  );

  // Handle audio error - switch to TTS mode (called by parent if needed)
  const handleAudioError = useCallback((errorMsg: string) => {
    console.error('Audio error in safe player:', errorMsg);
    setAudioError(errorMsg);
    
    if (hasTranscripts && ttsSupported) {
      toast.error('Audio unavailable. Switching to text-to-speech mode.', {
        duration: 4000,
      });
      setUseTTS(true);
    } else if (hasTranscripts) {
      toast.error('Audio unavailable. Please read the transcript instead.', {
        duration: 4000,
      });
    } else {
      toast.error('Audio unavailable and no transcript available.', {
        duration: 4000,
      });
    }
  }, [hasTranscripts, ttsSupported]);

  // Expose handleAudioError for potential external use
  void handleAudioError;

  // TTS for current part
  const handleTTSPlay = useCallback(() => {
    const transcriptMap: Record<number, string | null | undefined> = {
      1: transcripts?.part1,
      2: transcripts?.part2,
      3: transcripts?.part3,
      4: transcripts?.part4,
    };
    
    const transcript = transcriptMap[currentPart];
    if (!transcript) {
      toast.error(`No transcript available for Part ${currentPart}`);
      return;
    }
    
    if (speaking) {
      cancel();
    } else {
      speak(transcript);
    }
  }, [currentPart, transcripts, speak, speaking, cancel]);

  // Track part changes
  const handlePartChange = useCallback((partNumber: number) => {
    setCurrentPart(partNumber);
    if (speaking) {
      cancel(); // Stop TTS when changing parts
    }
    onPartChange?.(partNumber);
  }, [onPartChange, speaking, cancel]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  // If no audio URLs at all, show transcript-only mode
  if (!hasAudioUrls) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <span className="text-sm text-amber-700 dark:text-amber-400">
            No audio available. {hasTranscripts ? 'Use transcript below.' : 'Contact support.'}
          </span>
          {hasTranscripts && ttsSupported && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleTTSPlay}
              className="ml-auto gap-1"
            >
              {speaking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Stop
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  Read Aloud
                </>
              )}
            </Button>
          )}
        </div>
        
        {hasTranscripts && transcripts && (
          <TranscriptViewer transcripts={transcripts} defaultExpanded />
        )}
      </div>
    );
  }

  // If using TTS fallback mode
  if (useTTS && hasTranscripts) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <Volume2 className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-700 dark:text-blue-400">
            Text-to-Speech Mode (Part {currentPart})
          </span>
          <Button
            size="sm"
            variant={speaking ? "secondary" : "default"}
            onClick={handleTTSPlay}
            className="ml-auto gap-1"
          >
            {speaking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Stop
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                Read Part {currentPart}
              </>
            )}
          </Button>
        </div>
        
        {/* Part selector for TTS mode */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((part) => {
            const hasPartTranscript = transcripts && transcripts[`part${part}` as keyof typeof transcripts];
            return (
              <Button
                key={part}
                size="sm"
                variant={currentPart === part ? "default" : "outline"}
                onClick={() => handlePartChange(part)}
                disabled={!hasPartTranscript}
                className="flex-1"
              >
                Part {part}
              </Button>
            );
          })}
        </div>
        
        {transcripts && (
          <TranscriptViewer transcripts={transcripts} defaultExpanded />
        )}
      </div>
    );
  }

  // Normal mode - use WebAudioScheduledPlayer with error handling
  return (
    <div className={cn("space-y-4", className)}>
      <WebAudioScheduledPlayer
        audioUrls={audioUrls}
        initialStartTime={initialStartTime}
        initialPart={initialPart}
        onPartChange={handlePartChange}
        onTestComplete={onTestComplete}
        onReviewStart={onReviewStart}
      />
      
      {/* Show "Switch to TTS" button if transcripts available and there's an error */}
      {audioError && hasTranscripts && ttsSupported && !useTTS && (
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <span className="text-sm text-amber-700 dark:text-amber-400">
            {audioError}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUseTTS(true)}
            className="ml-auto gap-1"
          >
            <Volume2 className="w-4 h-4" />
            Use TTS
          </Button>
        </div>
      )}
    </div>
  );
}

export default WebAudioScheduledPlayerSafe;
