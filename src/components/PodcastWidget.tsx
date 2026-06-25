import React, { useState } from "react";

interface Track {
  id: string;
  title: string;
  duration: string;
}

export const PodcastWidget: React.FC = () => {
  const [activeTrack, setActiveTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const tracks: Track[] = [
    { id: "01", title: "Art in the City: How Modern Sculptures...", duration: "0:54" },
    { id: "02", title: "Is Film Photography Really Making a...", duration: "1:03" },
    { id: "03", title: "Behind the Scenes of Galleries: How...", duration: "0:42" },
    { id: "04", title: "Canvas Critical: Can Digital Representation...", duration: "1:07" },
    { id: "05", title: "Music as Therapy: How Sounds Influence...", duration: "0:59" },
  ];

  const handleTrackClick = (index: number) => {
    if (activeTrack === index) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrack(index);
      setIsPlaying(true);
    }
  };

  return (
    <section className="w-full px-6 py-12 md:py-16 bg-brand-light text-brand-dark transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 items-center">
        
        {/* Left Side: Interactive Podcast Card */}
        <div className="w-full lg:w-[500px] shrink-0">
          <div className="editorial-card p-6 rounded-xl flex flex-col md:flex-row lg:flex-col gap-6">
            {/* Podcast Cover Art */}
            <div className="w-full md:w-48 lg:w-full aspect-square border-[1.5px] border-brand-dark rounded-lg overflow-hidden shrink-0 relative bg-neutral-900 group">
              <img
                src="https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=400&h=400&q=80"
                alt="The Creative Pulse Podcast Cover"
                className="w-full h-full object-cover opacity-85 group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-left">
                <span className="text-[10px] text-accent-coral uppercase tracking-widest font-extrabold font-display">
                  Podcast Edition
                </span>
                <h4 className="text-white font-serif font-black text-xl leading-tight">
                  The Creative Pulse
                </h4>
              </div>
            </div>

            {/* Podcast Tracklist */}
            <div className="flex-1 flex flex-col gap-2.5 text-left font-sans">
              <div className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-extrabold mb-1">
                Recent Episodes
              </div>
              <div className="flex flex-col gap-1.5">
                {tracks.map((track, index) => {
                  const isCurrent = activeTrack === index;
                  return (
                    <button
                      key={track.id}
                      onClick={() => handleTrackClick(index)}
                      className={`w-full p-2.5 rounded-lg border border-transparent transition-all flex items-center justify-between text-xs font-semibold text-left group cursor-pointer ${
                        isCurrent
                          ? "bg-accent-coral/10 border-accent-coral text-accent-coral"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className={`text-[10px] font-bold ${isCurrent ? "text-accent-coral" : "text-neutral-400"}`}>
                          #{track.id}
                        </span>
                        
                        <div className="truncate pr-2">
                          <p className="truncate font-sans font-bold leading-none mb-0.5">
                            {track.title}
                          </p>
                          {isCurrent && isPlaying && (
                            <span className="text-[9px] text-accent-coral/80 font-medium animate-pulse">
                              Now playing...
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrent && isPlaying ? (
                          /* Equalizer Animation Bars */
                          <div className="flex items-end gap-0.5 h-3 w-4">
                            <span className="w-0.5 bg-accent-coral rounded-full animate-[bounce_0.8s_infinite] h-full"></span>
                            <span className="w-0.5 bg-accent-coral rounded-full animate-[bounce_0.5s_infinite_0.1s] h-3/4"></span>
                            <span className="w-0.5 bg-accent-coral rounded-full animate-[bounce_0.7s_infinite_0.2s] h-1/2"></span>
                          </div>
                        ) : (
                          <i className={`fa-solid ${isCurrent && !isPlaying ? "fa-play text-accent-coral" : "fa-circle-play text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-white"} text-sm`}></i>
                        )}
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono w-8 text-right">
                          {track.duration}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Header & CTA Button */}
        <div className="flex-1 flex flex-col justify-center items-start text-left lg:pl-8">
          <h2 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-neutral-900 dark:text-white mb-6 uppercase tracking-tight select-none">
            Have You Heard Our Podcast Yet?
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-base leading-relaxed font-sans max-w-xl mb-8">
            Dive deep into design diaries, artist spotlights, and trends shaping contemporary visual culture.
            Each episode hosts live conversations with pioneers in art, music, and architectural inspiration.
          </p>
          
          <button
            onClick={() => {
              if (activeTrack === null) {
                setActiveTrack(0);
                setIsPlaying(true);
              } else {
                setIsPlaying(!isPlaying);
              }
            }}
            className="editorial-btn px-8 py-3.5 bg-accent-coral hover:bg-accent-coral-dark text-white font-extrabold uppercase tracking-widest text-xs font-display rounded-md cursor-pointer flex items-center gap-2"
          >
            <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
            <span>{isPlaying ? "Pause Playlist" : "Listen to Playlist"}</span>
          </button>
        </div>

      </div>
    </section>
  );
};

export default PodcastWidget;
