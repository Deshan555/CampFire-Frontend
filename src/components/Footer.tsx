import { AtSign, Mail, Newspaper, Radio, SendHorizontal } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { subscribeNewsletter } from "../api";
import { siteConfig } from "../config/site";

interface FooterProps {
  categories?: string[];
}

export default function Footer({ categories = [] }: FooterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      await subscribeNewsletter(email.trim());
      setEmail("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const publicationCategories = categories.filter((category) => category !== "All").slice(0, 6);

  return (
    <footer className="publication-footer">
      <div className="footer-newsletter editorial-shell">
        <div>
          <p className="eyebrow">The evening read</p>
          <h2>A thoughtful ending to a busy day.</h2>
          <p>Our editors select the stories worth carrying into tomorrow.</p>
        </div>
        <form onSubmit={submit}>
          <label htmlFor="footer-email">Email address</label>
          <div className="footer-input-group">
            <AtSign size={17} aria-hidden="true" />
            <input id="footer-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            <button type="submit" disabled={status === "loading"} aria-label="Subscribe to newsletter"><SendHorizontal size={18} /></button>
          </div>
          <p role="status">
            {status === "success" ? "You are on the list." : status === "error" ? "Subscription failed. Please try again." : "One considered email. No noise."}
          </p>
        </form>
      </div>

      <div className="footer-main editorial-shell">
        <div className="footer-brand">
          <Link to="/" className="footer-wordmark">{siteConfig.name}</Link>
          <p>{siteConfig.description}</p>
          <div className="footer-socials" aria-label="Social links">
            <a href="#publication" aria-label="Publication updates"><Newspaper size={18} /></a>
            <a href="#newsletter" aria-label="Newsletter"><Mail size={18} /></a>
            <a href="#feed" aria-label="Live feed"><Radio size={18} /></a>
          </div>
        </div>

        <div className="footer-links">
          <h3>Sections</h3>
          {publicationCategories.length > 0 ? publicationCategories.map((category) => (
            <Link key={category} to={`/?category=${encodeURIComponent(category)}`}>{category}</Link>
          )) : <Link to="/">Latest stories</Link>}
        </div>

        <div className="footer-links">
          <h3>Publication</h3>
          <Link to="/editor">Editorial desk</Link>
          <Link to="/ai-writer">AI writer</Link>
          <a href="#editorial-policy">Editorial policy</a>
          <a href="#ai-transparency">AI transparency</a>
        </div>

        <div className="footer-links">
          <h3>Information</h3>
          <a href="#accessibility">Accessibility</a>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="mailto:editor@campfire.example">Contact the desk</a>
        </div>
      </div>

      <div className="footer-legal editorial-shell">
        <p>© {new Date().getFullYear()} {siteConfig.name}. Independent stories for curious minds.</p>
        <p>AI-assisted work is clearly labeled and reviewed according to our editorial policy.</p>
      </div>
    </footer>
  );
}
