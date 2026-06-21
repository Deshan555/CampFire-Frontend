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
  video?: { src: string; type: string; poster?: string };
  featured?: boolean;
  trending?: boolean;
  isPartner?: boolean;
  likes?: number;
  status?: 'approved' | 'pending' | 'rejected' | 'draft';
  authorUsername?: string;
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
    id: "banking-app",
    title: "How to create a mobile banking app in 2023-2024: Key features, tech stack, and common pitfalls",
    summary: "The mobile banking market is heated nowadays, but some entrepreneurs may fear its complexity. And it's not for nothing — there are many competing apps, law restrictions to follow, and a lot of features to include in the interface. In this article, we'll try to make banking app development less scary and explain what features any banking app needs to have, what difficulties you may encounter on this path, and what unique ideas you can implement in the process of mobile app development.",
    category: "Tech",
    date: "June 18, 2026",
    readingTime: "12 min read",
    author: AUTHORS.robert,
    image: "/hero_banking_app.png",
    featured: true,
    likes: 42,
    content: [
      "The mobile banking market is heated nowadays, but some entrepreneurs may fear its complexity. And it's not for nothing — there are many competing apps, law restrictions to follow, and a lot of features to include in the interface. In this article, we'll try to make banking app development less scary and explain what features any banking app needs to have, what difficulties you may encounter on this path, and what unique ideas you can implement in the process of mobile app development.",
      "To build a successful mobile banking product in today's environment, you must navigate strict compliance guidelines (such as GDPR, PSD2, and local banking laws) while creating an interface that feels modern, lightweight, and completely secure.",
      "The core architectural stack often features React Native or Flutter for client-side versatility, coupled with custom microservices running on AWS or Google Cloud for the transaction engine. High-performance databases like PostgreSQL or Cassandra handle record scaling, while secure OAuth/OIDC protocols shield API endpoints.",
      "Key features that separate standard applications from premium market leaders include intelligent analytics engines, instant peer-to-peer transfers, customizable virtual debit cards, and seamless integration with localized payment gateways.",
      "We recommend starting with a robust Minimal Viable Product (MVP) focusing on absolute core security features—biometric authentication, basic account balances, transaction histories, and card freeze triggers. Only after stabilizing this core should you layer in AI-powered budget trackers or advanced crypto-wallet connectors."
    ]
  },
  {
    id: "fintech-video",
    title: "Video Report: Future of Decentralized Fintech and Automated Liquidity in 2026",
    summary: "Watch our exclusive editorial video summary on how decentralized ledger infrastructures and custom micro-transaction APIs are transforming cross-border settlement channels in Europe.",
    category: "Tech",
    date: "June 18, 2026",
    readingTime: "3 min watch",
    author: AUTHORS.devon,
    video: {
      src: "https://vjs.zencdn.net/v/oceans.mp4",
      type: "video/mp4",
      poster: "/dashboard_mockup.png"
    },
    likes: 88,
    content: [
      "In this special SSPeech Video Brief, CEO Devon Lane discusses the latest technical aggregation patterns shaping cross-border payments.",
      "The accompanying video highlights details on transaction speed ratios, settlement compliance layers, and structural microservice bottlenecks."
    ]
  },
  {
    id: "trending-ai-role",
    title: "Understanding the role of AI in software development",
    summary: "AI coding assistants are evolving from simple auto-complete extensions into autonomous software engineers. Discover how developers are leveraging this shift to build products twice as fast without losing code quality.",
    category: "Tech",
    date: "09:00 AM",
    readingTime: "12 min read",
    author: AUTHORS.robert,
    trending: true,
    likes: 85,
    content: [
      "AI coding assistants are transforming the paradigm of software creation. No longer confined to basic syntax highlighting, advanced language models can now structure entire applications, suggest refactorings, and write unit tests.",
      "Developers who integrate agentic AI workflows report dramatic speedups in repetitive tasks like boilerplate generation, database configuration, and documentation writing, freeing them to focus on architecture and core business logic."
    ]
  },
  {
    id: "trending-efficiency",
    title: "Maximizing business efficiency: Why you need to know about the software development process",
    summary: "A deep dive into agile workflows, CI/CD pipelines, and modern collaboration frameworks that separate high-velocity engineering teams from stagnant organizations.",
    category: "How to",
    date: "11:15 AM",
    readingTime: "20 min read",
    author: AUTHORS.esther,
    trending: true,
    likes: 56,
    content: [
      "Engineering efficiency is not just about writing lines of code; it is about establishing robust deployment pipelines and tight feedback loops that let you ship features safely several times a day.",
      "By standardizing on clear Scrum and Kanban models, keeping codebases modular, and automating testing at every stage, startups can prevent burnout while delivering consistent value to users."
    ]
  },
  {
    id: "trending-knowledge-systems",
    title: "How AI-based knowledge management systems help companies improve performance",
    summary: "Explore how modern vector databases and retrieval-augmented generation (RAG) platforms are unifying fragmented company documentation to onboard new hires instantly.",
    category: "Tech",
    date: "08:57 AM",
    readingTime: "9 min read",
    author: AUTHORS.devon,
    trending: true,
    likes: 92,
    content: [
      "Fragmented internal documentation is one of the largest silent productivity drains in modern companies. AI-based search platforms resolve this by offering semantic search across all local files, repositories, and messaging history.",
      "By implementing semantic vector retrieval layers, developers can ask complex technical questions and receive accurate answers with direct source link references, accelerating developer velocity by up to 40%."
    ]
  },
  {
    id: "grid-data-management",
    title: "Top ways data management services can increase your business efficiency",
    summary: "Data-heavy workflows can quickly become bottlenecked without appropriate structuring. Discover why modern teams are building custom visual dashboards to monitor real-time pipeline status and track resource distribution.",
    category: "Tech",
    date: "12:00 AM",
    readingTime: "12 min read",
    author: AUTHORS.margareth,
    image: "/dashboard_mockup.png",
    likes: 73,
    content: [
      "Data-heavy workflows can quickly become bottlenecked without appropriate structuring. Discover why modern teams are building custom visual dashboards to monitor real-time pipeline status and track resource distribution.",
      "Integrating systems like Apache Kafka for streaming, and building custom dashboard cards with React and Tailwind CSS, provides operational managers with a premium window into their system health at a glance."
    ]
  },
  {
    id: "grid-mvp-guide",
    title: "How to build an MVP: A step-by-step guide for 2026",
    summary: "Building a minimum viable product doesn't mean sacrificing quality. Learn how to scope features, design interactive mockups, and run quick feedback loops to validate market demand.",
    category: "How to",
    date: "12:19 PM",
    readingTime: "9 min read",
    author: AUTHORS.robert,
    likes: 118,
    content: [
      "The goal of an MVP is to validate core hypotheses, not to ship a broken layout. Focus on polishing the single most critical flow—such as a user signing up and completing one target action—with exceptional design visual standards.",
      "Lean on responsive front-end frameworks and hosted backend services to get to market in weeks, rather than spending months planning complex microservices architectures."
    ]
  },
  {
    id: "grid-enterprise-features",
    title: "11 must-have features for successful enterprise mobile apps",
    summary: "From SSO authentication to local caching and offline sync, these are the core requirements that major IT departments expect from client-facing software.",
    category: "Tech",
    date: "09:27 AM",
    readingTime: "10 min read",
    author: AUTHORS.esther,
    likes: 64,
    content: [
      "Enterprise software requires a level of reliability and security that consumer products rarely demand. This includes absolute adherence to OAuth protocols, custom role-based access control (RBAC), and high-integrity audit logging.",
      "Offline sync using local database layers like SQLite or Realm guarantees that service technicians and remote representatives remain productive even when cellular coverage fails."
    ]
  },
  {
    id: "grid-web-services",
    title: "Finding the perfect fit: Exploring web app development services in Europe",
    summary: "An overview of top European engineering hubs, software agencies, and the legal structures required to build high-performing outsourcing partnerships.",
    category: "How to",
    date: "01:00 PM",
    readingTime: "7 min read",
    author: AUTHORS.margareth,
    likes: 47,
    content: [
      "European engineering hubs like Berlin, Warsaw, and Tallinn have become global epicenters for high-quality software craftsmanship. They combine deep technical academies with standard European compliance practices.",
      "When partnering with a service agency, establish clear performance benchmarks, check their previous design portfolios for responsive premium aesthetics, and define secure code sharing rules."
    ]
  },
  {
    id: "partner-mvp-guide",
    title: "How to build an MVP: A step-by-step guide for 2026",
    summary: "Our partners outline the most successful strategies for launching products in fast-paced software markets, showcasing how UX and performance impact retention rates.",
    category: "Case study",
    date: "01:00 PM",
    readingTime: "12 min read",
    author: AUTHORS.devon,
    isPartner: true,
    likes: 21,
    content: [
      "In our partners' news, launching MVP products is analyzed through the lens of user retention. Statistics show that products with high visual polish and quick interactive loading speeds maintain 30% higher second-month user retention.",
      "Designing clean layouts, avoiding complex loading states, and utilizing web hosting servers that score highly on Largest Contentful Paint (LCP) are the keys to long-term digital growth."
    ]
  }
];

export const CATEGORIES = ["All", "Awards", "How to", "Tech", "Case study", "Case"];
