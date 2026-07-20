import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchArticleDetails, likeArticle, fetchArticleSuggestions } from "../api";
import type { Article } from "../data/articles";
import VideoPlayer from "../components/VideoPlayer";
import Markdown from "../components/Markdown";
import { LoadingScreen } from "../components/common/LoadingScreen";
import { NoDataScreen } from "../components/common/NoDataScreen";
import ArticleArtwork from "../components/ArticleArtwork";
import ArticleShareModal from "../components/ArticleShareModal";
import { ArrowLeft, Bookmark, Headphones, Heart, Pause, Share2, UserCheck, UserPlus } from "lucide-react";

interface WordPosition {
  word: string;
  start: number;
  end: number;
}

interface ArticleImagePlacement {
  imageIndex: number;
  url: string;
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

const distributeArticleImages = (
  articleId: string,
  paragraphCount: number,
  imageUrls: string[] = []
): Map<number, ArticleImagePlacement[]> => {
  const placements = new Map<number, ArticleImagePlacement[]>();
  if (paragraphCount === 0 || imageUrls.length === 0) return placements;

  const paragraphSlots = Array.from({ length: paragraphCount }, (_, index) => index);
  let seed = Array.from(articleId).reduce(
    (hash, character) => Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0,
    2166136261
  );

  for (let index = paragraphSlots.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const swapIndex = seed % (index + 1);
    [paragraphSlots[index], paragraphSlots[swapIndex]] = [paragraphSlots[swapIndex], paragraphSlots[index]];
  }

  imageUrls.forEach((url, imageIndex) => {
    const paragraphIndex = paragraphSlots[imageIndex % paragraphSlots.length];
    const paragraphImages = placements.get(paragraphIndex) || [];
    paragraphImages.push({ imageIndex, url });
    placements.set(paragraphIndex, paragraphImages);
  });

  return placements;
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
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Emojis feedback state
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<number | null>(null);

  // Lightbox state for images placed inside the article body
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
        setShareModalOpen(false);
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
        <LoadingScreen message="Loading Publication Details..." />
      </div>
    );
  }

  if (fetchError || !article) {
    return (
      <div className="flex-1 py-20 text-center flex flex-col items-center justify-center">
        <NoDataScreen message="Article Not Found" />
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

  const inlineImagesByParagraph = distributeArticleImages(
    article.id,
    article.content.length,
    article.imageUrls
  );

  return (
    <div className="article-reading-page flex-1 font-sans">

      {/* Back to feed button */}
      <div className="article-back-row">
        <Link
          to="/"
          className="article-back-link"
        >
          <ArrowLeft size={16} />
          <span>Back to today&apos;s edition</span>
        </Link>
      </div>

      {/* Main article content panel */}
      <article className="article-news-layout text-left">
        {/* Category */}
        <div className="article-section-line">
          <span>{article.category}</span>
          {article.subcategory && <span>{article.subcategory}</span>}
        </div>

        {/* Title */}
        <h1 className="article-headline select-text">
          {article.title}
        </h1>

        <p className="article-standfirst">{article.summary}</p>

        {/* Author details section */}
        <div className="article-byline-bar">
          <div className="flex items-center gap-3">
            {article.author?.avatar ? (
              <img
                src={article.author.avatar}
                alt={article.author?.name || "Article author"}
                className="w-12 h-12 rounded-full object-cover border-[0.5px] border-neutral-200 dark:border-neutral-800"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300">
                {(article.author?.name || "E").charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-neutral-850 dark:text-neutral-50">
                {article.author?.name || "Editorial Team"}
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
              className={`article-icon-action article-listen-action ${isSpeaking && !isPaused
                  ? "is-active"
                  : ""
                }`}
              title={isSpeaking && !isPaused ? "Pause listening" : "Listen to article audio"}
            >
              {isSpeaking && !isPaused ? (
                <Pause size={15} />
              ) : (
                <Headphones size={15} />
              )}
              <span>{isSpeaking && !isPaused ? "Playing" : "Listen"}</span>
            </button>

            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`article-icon-action ${isFollowing ? "is-active" : ""}`}
            >
              {isFollowing ? <UserCheck size={15} /> : <UserPlus size={15} />}
              {isFollowing ? "Following" : "Follow"}
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`article-square-action ${isSaved ? "is-active" : ""}`}
              title="Bookmark"
            >
              <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Hero artwork */}
        <div className="article-hero-frame">
          <ArticleArtwork article={article} eager />
        </div>

        {/* Editorial body rendering Markdown (README) format */}
        <div className="editorial-prose text-neutral-850 dark:text-neutral-200 mb-12 max-w-3xl mx-auto select-text text-justify flex flex-col gap-6">
          {article.content.map((paragraph, index) => {
            const isCurrent = activeParagraphIndex === index;

            // Raw text version of paragraph for word highlighting during narration
            const rawText = paragraph
              .replace(/[\#\*\_\[\]\(\)\-\`\>]/g, "")
              .trim();

            return (
              <React.Fragment key={index}>
                <div
                  className={`transition-all duration-300 ${isCurrent
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

                {(inlineImagesByParagraph.get(index) || []).map(({ imageIndex, url }) => (
                  <figure key={`${url}-${imageIndex}`} className="article-inline-figure">
                    <button
                      type="button"
                      className="article-inline-image"
                      onClick={() => setActiveImageIndex(imageIndex)}
                      aria-label={`Open image ${imageIndex + 1} from ${article.title}`}
                    >
                      <img
                        src={url}
                        alt={`${article.title}, image ${imageIndex + 1}`}
                        loading="lazy"
                      />
                    </button>
                  </figure>
                ))}
              </React.Fragment>
            );
          })}
        </div>

        {/* Video follows the written article */}
        {article.video && (
          <div className="article-video-section">
            <div className="article-video-frame">
              <VideoPlayer
                src={article.video.src}
                poster={article.video.poster || undefined}
              />
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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border-[0.5px] text-sm font-semibold transition-all cursor-pointer ${isLiked
                  ? "bg-accent-purple/10 border-accent-purple text-purple-650 dark:text-purple-400"
                  : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-650 dark:text-neutral-450"
                }`}
            >
              <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
              <span>{likes} Likes</span>
            </button>
            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="p-2.5 rounded-lg border-[0.5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 cursor-pointer"
              title="Share article"
              aria-label="Share article"
              aria-haspopup="dialog"
            >
              <Share2 size={16} />
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
          <section className="suggested-news-section animate-fade-in" aria-labelledby="suggested-news-heading">
            <div className="suggested-news-heading">
              <span>Continue reading</span>
              <h3 id="suggested-news-heading">More from today&apos;s edition</h3>
            </div>
            <div className="suggested-news-list">
              {suggestions.map((art, index) => (
                <article key={art.id} className="suggested-news-row story-link-group">
                  <span className="suggested-news-number">{String(index + 1).padStart(2, "0")}</span>
                  <Link to={`/article/${art.id}`} className="suggested-news-image">
                    <ArticleArtwork article={art} />
                  </Link>
                  <div className="suggested-news-copy">
                    <p className="category-label">{art.category}</p>
                    <Link to={`/article/${art.id}`}><h4>{art.title}</h4></Link>
                    <p>{art.summary}</p>
                    <span>{art.date} · {art.readingTime}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

      </article>

      <ArticleShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={article.title}
        summary={article.summary}
        url={window.location.href}
      />

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
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer ${playbackRate === r
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
