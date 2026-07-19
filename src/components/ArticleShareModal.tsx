import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Mail, Share2, X } from "lucide-react";

interface ArticleShareModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  summary: string;
  url: string;
}

type CopyStatus = "idle" | "copied" | "error";

export default function ArticleShareModal({
  open,
  onClose,
  title,
  summary,
  url
}: ArticleShareModalProps) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const shareText = `${title}\n\n${summary}`;

  const shareOptions = useMemo(() => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedText = encodeURIComponent(shareText);

    return [
      {
        id: "facebook",
        label: "Facebook",
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        icon: <i className="fa-brands fa-facebook-f" aria-hidden="true" />
      },
      {
        id: "x",
        label: "X",
        href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        icon: <i className="fa-brands fa-x-twitter" aria-hidden="true" />
      },
      {
        id: "linkedin",
        label: "LinkedIn",
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        icon: <i className="fa-brands fa-linkedin-in" aria-hidden="true" />
      },
      {
        id: "whatsapp",
        label: "WhatsApp",
        href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
        icon: <i className="fa-brands fa-whatsapp" aria-hidden="true" />
      },
      {
        id: "email",
        label: "Email",
        href: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
        icon: <Mail size={18} aria-hidden="true" />
      }
    ];
  }, [shareText, title, url]);

  useEffect(() => {
    if (!open) return;

    setCopyStatus("idle");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, open]);

  if (!open) return null;

  const openShareTarget = (href: string) => {
    if (href.startsWith("mailto:")) {
      window.location.href = href;
    } else {
      window.open(href, "_blank", "noopener,noreferrer,width=720,height=620");
    }
    onClose();
  };

  const shareWithDevice = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title, text: summary, url });
      onClose();
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") {
        console.error("Unable to open the device share sheet:", error);
      }
    }
  };

  const copyArticleLink = async () => {
    const copyWithSelection = () => {
      const input = document.createElement("textarea");
      input.value = url;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();

      try {
        return document.execCommand("copy");
      } finally {
        document.body.removeChild(input);
      }
    };

    if (copyWithSelection()) {
      setCopyStatus("copied");
      return;
    }

    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await Promise.race<void>([
        navigator.clipboard.writeText(url),
        new Promise((_, reject) => {
          window.setTimeout(() => reject(new Error("Clipboard write timed out")), 800);
        })
      ]);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  return (
    <div
      className="article-share-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="article-share-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-share-title"
      >
        <header className="article-share-header">
          <div>
            <span>CampFire article</span>
            <h2 id="article-share-title">Share article</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close share dialog" autoFocus>
            <X size={18} />
          </button>
        </header>

        <p className="article-share-story-title">{title}</p>

        <div className="article-share-options">
          {shareOptions.map((option) => (
            <button
              type="button"
              key={option.id}
              className={`article-share-option article-share-option--${option.id}`}
              onClick={() => openShareTarget(option.href)}
              aria-label={`Share on ${option.label}`}
            >
              <span>{option.icon}</span>
              {option.label}
            </button>
          ))}

          {typeof navigator.share === "function" && (
            <button
              type="button"
              className="article-share-option article-share-option--device"
              onClick={shareWithDevice}
              aria-label="Open device sharing"
            >
              <span><Share2 size={18} aria-hidden="true" /></span>
              More
            </button>
          )}
        </div>

        <div className="article-share-link-group">
          <label htmlFor="article-share-url">Article link</label>
          <div>
            <input id="article-share-url" type="text" value={url} readOnly />
            <button type="button" onClick={copyArticleLink} className={copyStatus === "copied" ? "is-copied" : ""}>
              {copyStatus === "copied" ? <Check size={16} /> : <Copy size={16} />}
              {copyStatus === "copied" ? "Copied" : "Copy"}
            </button>
          </div>
          <p role="status" aria-live="polite">
            {copyStatus === "error" ? "Link could not be copied." : ""}
          </p>
        </div>
      </section>
    </div>
  );
}
