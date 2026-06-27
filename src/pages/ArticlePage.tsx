import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchArticleDetails, likeArticle, fetchArticleSuggestions } from "../api";
import type { Article } from "../data/articles";
import VideoPlayer from "../components/VideoPlayer";
import Markdown from "../components/Markdown";
import { LoadingSpinner, AnimatedButton } from "../components/canves-animations";

interface WordPosition {
  word: string;
  start: number;
  end: number;
}

const getWordPositions = (text: string): WordPosition[] => {
  const words: WordPosition[] = [];
  const wordRegex = /\S+/g;
  let match;
  while ((match = wordRegex.exec(text)) !== null) {
    words.push({
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return words;
};

export const ArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [suggestions, setSuggestions] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  
  // Likes state
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Emojis feedback state
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<number | null>(null);

  // Lightbox active gallery image state
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  // Text-To-Speech (TTS) states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState<number | null>(null);

  // Refs to avoid stale closures in SpeechSynthesis event callbacks
  const selectedVoiceNameRef = React.useRef(selectedVoiceName);
  const playbackRateRef = React.useRef(playbackRate);
  const currentUtteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  const boundaryFiredRef = React.useRef(false);
  const fallbackIntervalRef = React.useRef<any | null>(null);
  const fallbackTimeoutRef = React.useRef<any | null>(null);

  const clearFallbackTimers = () => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    selectedVoiceNameRef.current = selectedVoiceName;
  }, [selectedVoiceName]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  // Load SpeechSynthesis voices
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      
      // Filter for human/neural/premium/enhanced/siri voices
      let humanVoices = availableVoices.filter(v => {
        const name = v.name.toLowerCase();
        return (
          name.includes("google") ||
          name.includes("natural") ||
          name.includes("neural") ||
          name.includes("premium") ||
          name.includes("siri") ||
          name.includes("online") ||
          name.includes("enhanced")
        );
      });

      // If no natural/human-labeled voices are matched, fall back to standard voices but exclude robotic ones
      if (humanVoices.length === 0) {
        const roboticNames = [
          "albert", "bad news", "bells", "boing", "bubbles", "cellos", "deranged", "good news", "hysterical",
          "jester", "organ", "superstar", "trinoids", "whisper", "zarvox", "pipe organ"
        ];
        humanVoices = availableVoices.filter(v => {
          const name = v.name.toLowerCase();
          return !roboticNames.some(robotic => name.includes(robotic));
        });
      }

      setVoices(humanVoices);
      
      // Default to Siri, Microsoft Natural, Apple Premium/Enhanced, Google US English, etc.
      const defaultVoice = 
        humanVoices.find(v => v.name.toLowerCase().includes("siri")) ||
        humanVoices.find(v => v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("neural")) ||
        humanVoices.find(v => v.name.toLowerCase().includes("premium") || v.name.toLowerCase().includes("enhanced")) ||
        humanVoices.find(v => v.name.includes("Google US English") || v.name.includes("Google English")) ||
        humanVoices.find(v => v.lang.startsWith("en-US")) ||
        humanVoices.find(v => v.lang.startsWith("en")) ||
        humanVoices[0];
        
      if (defaultVoice) {
        setSelectedVoiceName(defaultVoice.name);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Clean up on unmount
    return () => {
      currentUtteranceRef.current = null;
      clearFallbackTimers();
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakParagraph = (index: number) => {
    if (!article || !window.speechSynthesis) return;

    // Terminate current speech
    window.speechSynthesis.cancel();
    clearFallbackTimers();

    if (index >= article.content.length) {
      // Reached the end of article paragraphs
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveParagraphIndex(null);
      setCurrentCharIndex(null);
      currentUtteranceRef.current = null;
      return;
    }

    setActiveParagraphIndex(index);
    setIsSpeaking(true);
    setIsPaused(false);
    setCurrentCharIndex(null); // Reset word boundaries for this new paragraph
    boundaryFiredRef.current = false;

    // Strip markdown formatting symbols for clean narration
    const rawText = article.content[index]
      .replace(/[\#\*\_\[\]\(\)\-\`\>]/g, "")
      .trim();

    if (!rawText) {
      // Skip empty line paragraphs
      speakParagraph(index + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(rawText);
    currentUtteranceRef.current = utterance;

    // Set user-selected voice using ref to prevent stale closures
    const voice = voices.find(v => v.name === selectedVoiceNameRef.current);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = playbackRateRef.current;

    utterance.onboundary = (event) => {
      boundaryFiredRef.current = true;
      clearFallbackTimers();
      
      // Highlight the word (Safari/Chrome event.charIndex relative to rawText)
      setCurrentCharIndex(event.charIndex);
    };

    utterance.onend = () => {
      if (currentUtteranceRef.current !== utterance) {
        return; // Ignore stale end event from previous cancel
      }
      clearFallbackTimers();
      // Speak next paragraph
      speakParagraph(index + 1);
    };

    utterance.onerror = (e) => {
      if (currentUtteranceRef.current !== utterance) {
        return; // Ignore stale error event from previous cancel
      }
      clearFallbackTimers();
      console.error("SpeechSynthesisUtterance error:", e);
      if (e.error !== "interrupted") {
        setIsSpeaking(false);
        setIsPaused(false);
        setActiveParagraphIndex(null);
        setCurrentCharIndex(null);
      }
    };

    // Start fallback simulation timer in case boundary events do not fire
    const wordPositions = getWordPositions(rawText);
    const rate = playbackRateRef.current;

    fallbackTimeoutRef.current = setTimeout(() => {
      if (!boundaryFiredRef.current && wordPositions.length > 0) {
        // Native onboundary is not firing (common with Google voices in Chrome/Safari)
        let currentWordIdx = 0;
        setCurrentCharIndex(wordPositions[currentWordIdx].start);

        const wordsPerSecond = 2.5 * rate;
        const msPerWord = 1000 / wordsPerSecond;

        fallbackIntervalRef.current = setInterval(() => {
          currentWordIdx++;
          if (currentWordIdx < wordPositions.length) {
            setCurrentCharIndex(wordPositions[currentWordIdx].start);
          } else {
            clearFallbackTimers();
          }
        }, msPerWord);
      }
    }, 800);

    window.speechSynthesis.speak(utterance);
  };

  const handlePlaySpeech = () => {
    if (!article) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      
      // Resume fallback highlighting interval if native boundaries are not firing
      if (!boundaryFiredRef.current && currentCharIndex !== null && activeParagraphIndex !== null) {
        const rawText = article.content[activeParagraphIndex]
          .replace(/[\#\*\_\[\]\(\)\-\`\>]/g, "")
          .trim();
        const wordPositions = getWordPositions(rawText);
        let currentWordIdx = wordPositions.findIndex(w => w.start === currentCharIndex);
        if (currentWordIdx === -1) currentWordIdx = 0;

        const rate = playbackRateRef.current;
        const wordsPerSecond = 2.5 * rate;
        const msPerWord = 1000 / wordsPerSecond;

        clearFallbackTimers();
        fallbackIntervalRef.current = setInterval(() => {
          currentWordIdx++;
          if (currentWordIdx < wordPositions.length) {
            setCurrentCharIndex(wordPositions[currentWordIdx].start);
          } else {
            clearFallbackTimers();
          }
        }, msPerWord);
      }
    } else {
      speakParagraph(activeParagraphIndex !== null ? activeParagraphIndex : 0);
    }
  };

  const handlePauseSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      clearFallbackTimers();
    }
  };

  const handleStopSpeech = () => {
    if (window.speechSynthesis) {
      currentUtteranceRef.current = null;
      window.speechSynthesis.cancel();
      clearFallbackTimers();
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveParagraphIndex(null);
      setCurrentCharIndex(null);
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    playbackRateRef.current = rate;
    if (isSpeaking && activeParagraphIndex !== null) {
      speakParagraph(activeParagraphIndex);
    }
  };

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoiceName(voiceName);
    selectedVoiceNameRef.current = voiceName;
    if (isSpeaking && activeParagraphIndex !== null) {
      speakParagraph(activeParagraphIndex);
    }
  };

  // Load article details from API
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setFetchError(false);
    
    let userParams: any = undefined;
    try {
      const stored = localStorage.getItem("editorUser");
      if (stored) {
        const u = JSON.parse(stored);
        userParams = {
          role: u.role,
          authorUsername: u.username,
          authorName: u.name
        };
      }
    } catch (e) {
      console.error(e);
    }
    
    fetchArticleDetails(id, userParams)
      .then((data) => {
        setArticle(data);
        setLikes(data.likes || 0);
        setLoading(false);
        
        // Reset local interaction states
        setIsLiked(false);
        setIsFollowing(false);
        setIsSaved(false);
        setFeedbackSubmitted(null);
        
        // Scroll to top
        window.scrollTo(0, 0);
      })
      .catch((err) => {
        console.error("⚠️ Failed to load article details from API:", err);
        setFetchError(true);
        setLoading(false);
      });

    fetchArticleSuggestions(id)
      .then((data) => {
        setSuggestions(data);
      })
      .catch((err) => {
        console.error("⚠️ Failed to load article suggestions:", err);
        setSuggestions([]);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 py-32 text-center flex flex-col items-center justify-center bg-white dark:bg-brand-dark">
        <LoadingSpinner message="Loading Publication Details..." size="md" />
      </div>
    );
  }

  if (fetchError || !article) {
    return (
      <div className="flex-1 py-20 text-center flex flex-col items-center justify-center">
        <h2 className="font-serif text-3xl font-black text-neutral-900 dark:text-neutral-55 mb-4">
          Article Not Found
        </h2>
        <p className="text-neutral-500 mb-8 max-w-sm">
          The publication you are searching for might have been archived or moved to another edition.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Return to home feed
        </Link>
      </div>
    );
  }

  const handleLike = () => {
    likeArticle(article.id)
      .then((res) => {
        setLikes(res.likes);
        setIsLiked(!isLiked);
      })
      .catch((err) => {
        console.error("⚠️ Failed to submit like:", err);
      });
  };

  const emojis = [
    { label: "Unhappy", symbol: "😞", iconClass: "fa-regular fa-face-frown text-red-500 hover:text-red-600 transition-colors" },
    { label: "Neutral", symbol: "😐", iconClass: "fa-regular fa-face-meh text-amber-500 hover:text-amber-600 transition-colors" },
    { label: "Happy", symbol: "😊", iconClass: "fa-regular fa-face-smile text-emerald-500 hover:text-emerald-600 transition-colors" },
    { label: "Loved it", symbol: "🤩", iconClass: "fa-solid fa-face-grin-stars text-accent-coral" },
  ];

  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-12 border-x-[0.5px] border-neutral-200 dark:border-neutral-800 transition-colors duration-300 font-sans">
      
      {/* Back to feed button */}
      <div className="mb-8 flex justify-start">
        <Link
          to="/"
          className="group flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-455 dark:hover:text-neutral-100 transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          <span>Back to articles</span>
        </Link>
      </div>

      {/* Main article content panel */}
      <article className="text-left">
        {/* Category */}
        <span className="text-xs font-sans font-extrabold uppercase tracking-widest text-accent-coral dark:text-accent-coral mb-3 block">
          {article.category}
        </span>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 dark:text-neutral-50 leading-[1.15] mb-6 select-text">
          {article.title}
        </h1>

        {/* Author details section */}
        <div className="flex flex-wrap items-center justify-between border-y-[0.5px] border-neutral-200 dark:border-neutral-800 py-4 mb-8">
          <div className="flex items-center gap-3">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-12 h-12 rounded-full object-cover border-[0.5px] border-neutral-200 dark:border-neutral-800"
            />
            <div>
              <p className="text-sm font-bold text-neutral-850 dark:text-neutral-50">
                {article.author.name}
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-550 font-medium">
                {article.author.role} • {article.readingTime} • {article.date}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-2 sm:mt-0">
            {/* Listen Button */}
            <button
              onClick={isSpeaking && !isPaused ? handlePauseSpeech : handlePlaySpeech}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-display transition-all cursor-pointer flex items-center gap-1.5 border-[1.5px] ${
                isSpeaking && !isPaused
                  ? "bg-accent-coral text-white border-brand-dark shadow-[2px_2px_0px_0px_#111]"
                  : "bg-white text-neutral-900 hover:bg-neutral-50 border-neutral-300 dark:bg-neutral-900 dark:text-white dark:border-neutral-800 dark:hover:bg-neutral-800"
              }`}
              title={isSpeaking && !isPaused ? "Pause listening" : "Listen to article audio"}
            >
              {isSpeaking && !isPaused ? (
                <i className="fa-solid fa-volume-high animate-pulse"></i>
              ) : (
                <i className="fa-solid fa-headphones"></i>
              )}
              <span>{isSpeaking && !isPaused ? "Playing" : "Listen"}</span>
            </button>

            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isFollowing
                  ? "bg-neutral-105 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  : "bg-neutral-900 text-white hover:bg-neutral-850 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2.5 rounded-full border-[0.5px] transition-all cursor-pointer ${
                isSaved
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent"
                  : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-550"
              }`}
              title="Bookmark"
            >
              <i className={`${isSaved ? "fa-solid" : "fa-regular"} fa-bookmark text-sm`}></i>
            </button>
          </div>
        </div>

        {/* Hero media display */}
        {article.video ? (
          <div className="w-full aspect-[16/10] bg-neutral-100 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden mb-8 flex">
            <VideoPlayer
              src={article.video.src}
              poster={article.video.poster}
            />
          </div>
        ) : article.image ? (
          <div className="w-full aspect-[16/10] bg-neutral-100 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden mb-8">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}

        {/* Editorial body rendering Markdown (README) format */}
        <div className="editorial-prose text-neutral-850 dark:text-neutral-200 mb-12 max-w-3xl mx-auto select-text text-justify flex flex-col gap-6">
          {article.content.map((paragraph, index) => {
            const isCurrent = activeParagraphIndex === index;
            
            // Raw text version of paragraph for word highlighting during narration
            const rawText = paragraph
              .replace(/[\#\*\_\[\]\(\)\-\`\>]/g, "")
              .trim();

            return (
              <div
                key={index}
                className={`transition-all duration-300 ${
                  isCurrent
                    ? "bg-accent-coral/10 border-l-[3.5px] border-accent-coral pl-4 pr-2 py-3 rounded-r-lg"
                    : ""
                }`}
              >
                {isCurrent ? (
                  <p className="font-serif text-sm sm:text-base md:text-lg leading-relaxed text-neutral-850 dark:text-neutral-200 select-text text-justify">
                    {getWordPositions(rawText).map((wp, i, arr) => {
                      const isWordActive =
                        currentCharIndex !== null &&
                        wp.start <= currentCharIndex &&
                        currentCharIndex < wp.end;
                      return (
                        <React.Fragment key={i}>
                          <span
                            className={
                              isWordActive
                                ? "bg-accent-coral text-white px-1 py-0.5 rounded font-semibold shadow-sm transition-colors duration-100"
                                : "transition-colors duration-300"
                            }
                          >
                            {wp.word}
                          </span>
                          {i < arr.length - 1 ? " " : ""}
                        </React.Fragment>
                      );
                    })}
                  </p>
                ) : (
                  <Markdown content={paragraph} />
                )}
              </div>
            );
          })}
        </div>

        {/* Article Gallery Section */}
        {article.imageUrls && article.imageUrls.length > 0 && (
          <div className="mt-12 border-t-[0.5px] border-neutral-200 dark:border-neutral-800 pt-10 max-w-3xl mx-auto">
            <span className="block text-[10px] font-extrabold uppercase text-accent-purple tracking-widest mb-1.5 font-sans">
              Visual Insights
            </span>
            <h3 className="font-serif text-2xl font-black text-neutral-900 dark:text-white leading-tight mb-6">
              Featured Gallery
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {article.imageUrls.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className="relative group aspect-[4/3] rounded-2xl overflow-hidden border-[0.5px] border-neutral-200 dark:border-neutral-800 shadow-sm cursor-zoom-in bg-neutral-50 dark:bg-neutral-900/30"
                >
                  <img
                    src={url}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] select-none"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-white/90 dark:bg-neutral-900/90 flex items-center justify-center shadow-md scale-90 group-hover:scale-100 transition-all duration-300">
                      <i className="fa-solid fa-magnifying-glass-plus text-neutral-800 dark:text-white text-xs"></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lightbox Popover / Dialog Overlay */}
        {activeImageIndex !== null && article.imageUrls && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 md:p-8 select-none animate-fade-in"
            onClick={() => setActiveImageIndex(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveImageIndex(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border-none outline-none"
              title="Close Gallery"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            {/* Previous Image */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) => 
                  prev !== null ? (prev === 0 ? article.imageUrls!.length - 1 : prev - 1) : 0
                );
              }}
              className="absolute left-4 md:left-8 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border-none outline-none"
              title="Previous Image"
            >
              <i className="fa-solid fa-chevron-left text-base"></i>
            </button>

            {/* Image Preview Container */}
            <div
              className="relative max-w-5xl w-full max-h-[75vh] md:max-h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={article.imageUrls[activeImageIndex]}
                alt={`Expanded Gallery view ${activeImageIndex + 1}`}
                className="max-w-full max-h-[75vh] md:max-h-[80vh] object-contain rounded-lg shadow-2xl select-none"
              />
            </div>

            {/* Next Image */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) => 
                  prev !== null ? (prev === article.imageUrls!.length - 1 ? 0 : prev + 1) : 0
                );
              }}
              className="absolute right-4 md:right-8 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border-none outline-none"
              title="Next Image"
            >
              <i className="fa-solid fa-chevron-right text-base"></i>
            </button>

            {/* Captions / Indicators */}
            <div className="absolute bottom-6 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border-[0.5px] border-white/20">
              <span className="text-white text-xs font-semibold tracking-wider font-mono">
                {activeImageIndex + 1} / {article.imageUrls.length}
              </span>
            </div>
          </div>
        )}

        {/* Interactive Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between border-y-[0.5px] border-neutral-200 dark:border-neutral-800 py-6 my-10 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-[0.5px] text-sm font-semibold transition-all cursor-pointer ${
                isLiked
                  ? "bg-accent-purple/10 border-accent-purple text-purple-650 dark:text-purple-400"
                  : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-650 dark:text-neutral-450"
              }`}
            >
              <i className={`${isLiked ? "fa-solid" : "fa-regular"} fa-heart text-base`}></i>
              <span>{likes} Likes</span>
            </button>
            <button className="p-2.5 rounded-full border-[0.5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 cursor-pointer" title="Share nodes">
              <i className="fa-solid fa-share-nodes text-sm"></i>
            </button>
          </div>

          {/* Quick Reaction Emojis widget */}
          <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-900/30 px-5 py-2 rounded-full border-[0.5px] border-neutral-200 dark:border-neutral-800">
            <span className="text-xs font-sans font-bold text-neutral-500">Rate article:</span>
            {feedbackSubmitted !== null ? (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-455 animate-pulse flex items-center gap-1.5">
                Thanks! <i className={`${emojis[feedbackSubmitted].iconClass} text-base`}></i>
              </span>
            ) : (
              <div className="flex gap-3">
                {emojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFeedbackSubmitted(idx)}
                    title={emoji.label}
                    className="hover:scale-125 transition-all duration-200 cursor-pointer flex items-center justify-center p-0.5"
                  >
                    <i className={`${emoji.iconClass} text-lg`}></i>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related / Suggested Articles Section */}
        {suggestions.length > 0 && (
          <div className="mt-16 pt-10 border-t-[0.5px] border-neutral-200 dark:border-neutral-800 text-left animate-fade-in">
            <h3 className="font-serif text-xl font-black text-neutral-900 dark:text-neutral-50 mb-6 tracking-tight">
              Suggested Reads
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {suggestions.map((art) => (
                <Link
                  key={art.id}
                  to={`/article/${art.id}`}
                  className="group flex flex-col gap-3 hover:opacity-95 transition-opacity cursor-pointer"
                >
                  {art.image ? (
                    <div className="aspect-[16/10] bg-neutral-105 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm shrink-0">
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] bg-neutral-50 dark:bg-neutral-900 border-[0.5px] border-neutral-250 dark:border-neutral-850 rounded-xl flex items-center justify-center shrink-0 text-neutral-350">
                      <i className="fa-solid fa-newspaper text-2xl"></i>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-accent-coral dark:text-accent-coral">
                      {art.category}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-1 line-clamp-2 group-hover:underline leading-snug">
                      {art.title}
                    </h4>
                    <p className="text-[11px] text-neutral-450 dark:text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </article>

      {/* Floating Audio Player Panel */}
      {isSpeaking && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-white/95 dark:bg-brand-charcoal/95 border-[1.5px] border-brand-dark rounded-xl shadow-[4px_4px_0px_0px_#000] p-4 flex flex-col gap-3 backdrop-blur-md animate-fade-in text-neutral-900 dark:text-white transition-all">
          
          <div className="flex items-center justify-between">
            <div className="text-left truncate flex-1 pr-4">
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-accent-coral font-display">
                Audio Reader Active
              </span>
              <h5 className="font-serif font-black text-sm truncate">
                {article.title}
              </h5>
            </div>
            
            {/* Playback Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={isPaused ? handlePlaySpeech : handlePauseSpeech}
                className="w-8 h-8 rounded-full border border-brand-dark hover:bg-accent-coral hover:text-white transition-all flex items-center justify-center cursor-pointer bg-neutral-50 dark:bg-neutral-800"
                title={isPaused ? "Play" : "Pause"}
              >
                <i className={`fa-solid ${isPaused ? "fa-play pl-0.5" : "fa-pause"}`}></i>
              </button>
              
              <button
                onClick={handleStopSpeech}
                className="w-8 h-8 rounded-full border border-brand-dark hover:bg-red-500 hover:text-white transition-all flex items-center justify-center cursor-pointer bg-neutral-50 dark:bg-neutral-800"
                title="Stop reading"
              >
                <i className="fa-solid fa-square text-xs"></i>
              </button>
            </div>
          </div>

          <div className="w-full h-[0.5px] bg-neutral-200 dark:bg-neutral-800"></div>

          {/* Player Adjustment rate & voice */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Speed settings */}
            <div className="flex items-center gap-1.5 text-left">
              <span className="text-neutral-450 dark:text-neutral-550 font-bold uppercase tracking-wider text-[9px]">
                Speed:
              </span>
              <div className="flex gap-1">
                {[0.75, 1, 1.25, 1.5, 2].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRateChange(r)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer ${
                      playbackRate === r
                        ? "bg-accent-coral text-white border-brand-dark"
                        : "border-neutral-200 hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {r}x
                  </button>
                ))}
              </div>
            </div>

            {/* Voices settings */}
            {voices.length > 0 && (
              <div className="flex items-center gap-1.5 text-left">
                <span className="text-neutral-455 dark:text-neutral-550 font-bold uppercase tracking-wider text-[9px]">
                  Voice:
                </span>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.5 rounded text-[10px] font-sans text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-accent-coral max-w-[140px] truncate"
                >
                  {voices
                    .filter((v) => v.lang.startsWith("en") || v.lang.startsWith("es"))
                    .map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name.replace("Google", "").replace("Microsoft", "").trim()} ({v.lang})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
          
        </div>
      )}

    </div>
  );
};

export default ArticlePage;
