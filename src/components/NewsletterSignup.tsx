import React, { useState } from "react";
import { subscribeNewsletter } from "../api";

export const NewsletterSignup: React.FC = () => {
  const [weeklySelected, setWeeklySelected] = useState(true);
  const [monthlySelected, setMonthlySelected] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      await subscribeNewsletter(email.trim());
      setSubscribed(true);
      setEmail("");
    } catch (err: any) {
      console.error("⚠️ Failed to subscribe to newsletter:", err);
      setError("Failed to subscribe. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full px-6 py-12 md:py-16 bg-brand-light text-brand-dark transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-10 items-stretch">
        
        {/* Left Column: Option Checkbox Cards */}
        <div className="flex-1 flex flex-col sm:flex-row gap-4 text-left">
          {/* Option 1: Weekly Highlights */}
          <button
            onClick={() => setWeeklySelected(!weeklySelected)}
            className={`flex-1 p-5 rounded-3xl border transition-all duration-300 text-left flex flex-col justify-between items-start gap-6 cursor-pointer select-none ${
              weeklySelected
                ? "bg-[var(--color-sage-light)] border-[var(--color-sage-dark)] text-[var(--color-sage-dark)] shadow-sm"
                : "bg-white border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between w-full mb-3">
                <span className={`text-[10px] uppercase tracking-widest font-extrabold font-display ${weeklySelected ? "text-accent-coral" : "text-neutral-400"}`}>
                  Every Saturday
                </span>
                
                {/* Custom Checkbox */}
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${weeklySelected ? "bg-[var(--color-sage-dark)] border-[var(--color-sage-dark)] text-white" : "border-neutral-300 bg-white"}`}>
                  {weeklySelected && <i className="fa-solid fa-check text-[10px]"></i>}
                </div>
              </div>
              
              <h4 className="font-serif font-black text-lg text-neutral-900 leading-tight mb-2">
                Weekly Highlights
              </h4>
              <p className="text-neutral-500 text-xs leading-relaxed font-sans">
                Stay updated with a curated roundup of the week's most talked-about content.
              </p>
            </div>
            
            <div className="text-[10px] font-bold text-neutral-400 font-display uppercase tracking-widest">
              {weeklySelected ? "✓ Subscribed" : "+ Select Option"}
            </div>
          </button>

          {/* Option 2: Monthly Digest */}
          <button
            onClick={() => setMonthlySelected(!monthlySelected)}
            className={`flex-1 p-5 rounded-3xl border transition-all duration-300 text-left flex flex-col justify-between items-start gap-6 cursor-pointer select-none ${
              monthlySelected
                ? "bg-[var(--color-sage-light)] border-[var(--color-sage-dark)] text-[var(--color-sage-dark)] shadow-sm"
                : "bg-white border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between w-full mb-3">
                <span className={`text-[10px] uppercase tracking-widest font-extrabold font-display ${monthlySelected ? "text-accent-coral" : "text-neutral-400"}`}>
                  Last week of the month
                </span>
                
                {/* Custom Checkbox */}
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${monthlySelected ? "bg-[var(--color-sage-dark)] border-[var(--color-sage-dark)] text-white" : "border-neutral-300 bg-white"}`}>
                  {monthlySelected && <i className="fa-solid fa-check text-[10px]"></i>}
                </div>
              </div>
              
              <h4 className="font-serif font-black text-lg text-neutral-900 leading-tight mb-2">
                Monthly Digest
              </h4>
              <p className="text-neutral-500 text-xs leading-relaxed font-sans">
                Take a step back and savor a well-rounded recap of the month's highlights.
              </p>
            </div>
            
            <div className="text-[10px] font-bold text-neutral-400 font-display uppercase tracking-widest">
              {monthlySelected ? "✓ Subscribed" : "+ Select Option"}
            </div>
          </button>
        </div>

        {/* Right Column: Input Sign Up Form */}
        <div className="flex-1 flex flex-col justify-center items-start text-left lg:pl-10">
          <h2 className="font-serif font-black text-4xl sm:text-5xl leading-[1.05] text-neutral-900 dark:text-white uppercase tracking-tight select-none mb-6">
            Sign Up for Our Newsletter
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-base leading-relaxed font-sans max-w-xl mb-8">
            Choose your preferred delivery cadence and join our community of over 45,000 creative readers today.
          </p>

          {subscribed ? (
            <div className="w-full p-4 bg-emerald-50 text-emerald-800 border-[1.5px] border-emerald-800 rounded-md font-sans text-xs font-bold shadow-[2px_2px_0px_0px_#065f46] animate-fade-in">
              ✓ Thank you for subscribing! We've sent a confirmation to your inbox.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="w-full flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-[var(--color-warm-surface)] border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-sage focus:border-sage text-sm rounded-2xl font-sans placeholder-neutral-400 text-neutral-900"
              />
              <button
                type="submit"
                disabled={loading}
                className="editorial-btn w-full sm:w-auto py-3 px-8 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? "Subscribing..." : "Sign Up"}
              </button>
            </form>
          )}
          
          {error && (
            <p className="text-red-500 font-sans text-xs font-bold mt-2">
              {error}
            </p>
          )}
        </div>

      </div>
    </section>
  );
};

export default NewsletterSignup;
