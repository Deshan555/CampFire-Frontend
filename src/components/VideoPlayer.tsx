import { createPlayer } from '@videojs/react';
import { VideoSkin, Video, videoFeatures } from '@videojs/react/video';
import '@videojs/react/video/skin.css';

const Player = createPlayer({ features: videoFeatures });

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

function getYoutubeId(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2];
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/")[2];
      }
      if (parsed.pathname.startsWith("/v/")) {
        return parsed.pathname.split("/")[2];
      }
      return parsed.searchParams.get("v");
    }
  } catch (e) {
    // Fallback to regex
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const youtubeId = getYoutubeId(src);

  if (youtubeId) {
    return (
      <div className="w-full h-full min-h-[220px] md:min-h-[360px] relative overflow-hidden flex bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full absolute inset-0"
        ></iframe>
      </div>
    );
  }

  return (
    <Player.Provider>
      <div className="w-full h-full min-h-[220px] md:min-h-[360px] relative overflow-hidden flex">
        <VideoSkin 
          poster={poster} 
          className="w-full h-full flex flex-col flex-1 [&_video]:object-cover [&_video]:w-full [&_video]:h-full [&_video]:absolute [&_video]:inset-0 [&_.vjs-tech]:w-full [&_.vjs-tech]:h-full [&_.video-js]:w-full [&_.video-js]:h-full [&_.video-js]:absolute [&_.video-js]:inset-0 [&_.vjs-poster]:bg-cover"
        >
          <Video 
            src={src} 
            playsInline 
            className="w-full h-full object-cover absolute inset-0"
          />
        </VideoSkin>
      </div>
    </Player.Provider>
  );
}

export default VideoPlayer;
