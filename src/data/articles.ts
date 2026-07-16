export interface Author {
  name: string;
  role: string;
  avatar: string;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string[];
  author: Author;
  date: string;
  readingTime: string;
  category: string;
  image?: string;
  imageUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
  reviewFeedback?: string;
  reviewedAt?: string;
  video?: { src: string; type: string; poster?: string };
  featured?: boolean;
  trending?: boolean;
  isPartner?: boolean;
  likes?: number;
  status?: 'approved' | 'pending' | 'rejected' | 'draft';
  authorUsername?: string;
  hashtags?: string[];
  subcategory?: string;
  subcategoryId?: string;
  targetCountries?: string[];
}

export const AUTHORS: Record<string, Author> = {
  robert: {
    name: "Robert Fox",
    role: "Tech writer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
  },
  margareth: {
    name: "Margareth Jameson",
    role: "Designer",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
  },
  esther: {
    name: "Esther Howard",
    role: "Art Director",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
  },
  devon: {
    name: "Devon Lane",
    role: "CEO",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
  },
};

export const ARTICLES: Article[] = [
  {
    id: "japan-travel",
    title: "10 Hidden Gems in Kyoto, Japan",
    summary: "Discover the serene temples, traditional teahouses, and quiet bamboo forests that most tourists miss when visiting Japan's ancient capital.",
    category: "Destinations",
    date: "November 12, 2024",
    readingTime: "8 min read",
    author: AUTHORS.esther,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&h=675&q=80",
    featured: true,
    likes: 124,
    content: [
      "In the digital age, where cameras are in everyone's pocket, the resurgence of film photography might seem surprising. Yet, it has evolved from a medium of necessity to a cherished art form. What makes film photography so enduringly relevant in a world dominated by pixels?",
      "For many, the appeal lies in the tactile process: winding the film, adjusting the mechanical dials, and hearing the satisfying click of the physical shutter. Unlike digital cameras that offer endless retakes, film forces the photographer to slow down and consider each frame with intent.",
      "The chemistry of film adds another dimension. The unique grain structure, the organic way highlights roll off, and the unpredictable color shifts all contribute to an aesthetic that digital filters attempt to mimic but rarely replicate. Developing film in a darkroom also brings back a level of craftsmanship and surprise that the instant feedback of screen previews has completely eliminated."
    ]
  },
  {
    id: "alps-hiking",
    title: "Hiking the Swiss Alps: A Beginner's Guide",
    summary: "Everything you need to know before tackling the majestic trails of the Swiss Alps, from gear recommendations to the best scenic routes.",
    category: "Guides",
    date: "September 18, 2024",
    readingTime: "6 min read",
    author: AUTHORS.margareth,
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&h=450&q=80",
    trending: true,
    likes: 92,
    content: [
      "Explore the world of sound artist Leo Hart, who transforms urban noise into captivating musical compositions. In this detailed interview, we discuss the borders between acoustic clutter and auditory art.",
      "Leo Hart finds beauty where others find annoyance. The rumble of subways, the chatter of crowds, and the hiss of rain on asphalt are the instruments he uses. By utilizing specialized field recorders, Hart captures raw sounds and loops them into rich, textured acoustic ambient pieces.",
      "'The city is constantly performing,' Hart explains. 'Our job as sound artists is not to silence the environment, but to guide the listener's focus so they hear the inherent rhythm and harmonic structure of our shared urban spaces.'"
    ]
  },
  {
    id: "street-food-bangkok",
    title: "The Ultimate Bangkok Street Food Tour",
    summary: "Dive into the vibrant culinary scene of Thailand's capital. We explore the bustling night markets and hidden alleys to find the best Pad Thai and Mango Sticky Rice.",
    category: "Experiences",
    date: "November 7, 2024",
    readingTime: "10 min read",
    author: AUTHORS.esther,
    image: "https://images.unsplash.com/photo-1504280654497-6a568b20cb37?auto=format&fit=crop&w=800&h=450&q=80",
    trending: true,
    likes: 147,
    content: [
      "Discover the creative journey of Eva Martinez, a self-taught painter whose bold use of color and texture redefines modern art. We step inside her Madrid studio to discuss her latest abstract exhibits.",
      "Martinez's style is immediately recognizable for its thick, impasto layers and vibrant, high-contrast color choices. Her works, often spanning several meters, dominate galleries with an energetic physical presence that commands attention.",
      "Initially working in corporate graphic design, Martinez walked away from digital design to reconnect with physical canvas. 'I needed the friction of the bristles, the smell of linseed oil, and the unpredictability of wet paint,' she shares."
    ]
  },
  {
    id: "unmissable-shows",
    title: "Unmissable Shows This Season. Our recommendations",
    summary: "Get ready for an unforgettable cultural experience. From performance art to physical theater and experimental visual projections, here is our handpicked list of shows you cannot miss this autumn.",
    category: "Art",
    date: "November 10, 2024",
    readingTime: "14 min read",
    author: AUTHORS.robert,
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&h=450&q=80",
    likes: 85,
    content: [
      "Get ready for an unforgettable cultural experience. From performance art to physical theater and experimental visual projections, here is our handpicked list of shows you cannot miss this autumn.",
      "This season marks a powerful return to interactive and immersive theater layouts. Directors are breaking down the fourth wall, placing audiences directly in the center of the staging, and utilizing multi-sensory projections to enhance dramatic tension."
    ]
  },
  {
    id: "hidden-gems-exhibits",
    title: "Hidden Gems: Lesser-Known Exhibits Worth Exploring",
    summary: "Discover the beauty of art off the beaten path. We tour five boutique galleries and independent artist collectives showing remarkable installations that bypass mainstream gallery attention.",
    category: "Art",
    date: "November 10, 2024",
    readingTime: "10 min read",
    author: AUTHORS.devon,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&h=450&q=80",
    likes: 67,
    content: [
      "Discover the beauty of art off the beaten path. We tour five boutique galleries and independent artist collectives showing remarkable installations that bypass mainstream gallery attention.",
      "Often, the most innovative and raw artistic statements are made on shoestring budgets in converted industrial garages. These venues allow artists absolute creative freedom, free from the commercial expectations of major national museums."
    ]
  },
  {
    id: "design-diaries",
    title: "Design Diaries: Where to Find Inspiration",
    summary: "From organic sculpture forms in urban parks to architectural concrete structures and historical graphic design, discover where leading modern designers turn to recharge their creative batteries.",
    category: "Design",
    date: "November 8, 2024",
    readingTime: "5 min read",
    author: AUTHORS.margareth,
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&h=450&q=80",
    likes: 112,
    content: [
      "From organic sculpture forms in urban parks to architectural concrete structures and historical graphic design, discover where leading modern designers turn to recharge their creative batteries.",
      "Inspiration is rarely found by staring at a computer screen or browsing design aggregation sites. True creative breakthroughs occur when you step outside and observe how light hits raw concrete, how shadows shift at sunset, or how old book layouts utilized white space."
    ]
  },
  {
    id: "creative-pulse",
    title: "The Creative Pulse Podcast: Audio Edition",
    summary: "Listen to the latest episodes of The Creative Pulse, exploring the intersections of art, design, and music with leading voices in the creative industry.",
    category: "Podcast",
    date: "November 1, 2024",
    readingTime: "25 min listen",
    author: AUTHORS.devon,
    video: {
      src: "https://vjs.zencdn.net/v/oceans.mp4",
      type: "video/mp4",
      poster: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&h=600&q=80"
    },
    likes: 245,
    content: [
      "The Creative Pulse is our weekly auditory journey into the minds of makers. Hosted by Devon Lane, each episode hosts a dialog with musicians, visual artists, and designers who push boundaries.",
      "In this special compilation, we review clip highlights from our first five episodes, covering topics from city acoustics to the tactile allure of modern painting."
    ]
  }
];

export const CATEGORIES = ["All", "Latest", "Trending", "Art", "Design", "Music", "Podcast"];
