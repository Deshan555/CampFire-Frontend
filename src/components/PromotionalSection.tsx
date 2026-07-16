import React from "react";
// Removed unused lucide-react imports

const PromotionalSection: React.FC = () => {
  return (
    <section className="w-full pb-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Left Column - 2 Stacked Cards */}
      <div className="flex flex-col gap-6">
        
        {/* Booking Promo Card */}
        <div className="bg-[#111] rounded-2xl p-8 flex flex-col justify-between h-full text-white relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=600&q=80')" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/20 z-0" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center mb-10">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold mb-2 leading-tight">
                Explore more to get your<br/>comfort zone
              </h3>
              <p className="text-white/70 text-sm mb-6">
                Book your perfect stay with us.
              </p>
              <button className="bg-white text-black px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                Booking Now <span className="text-lg leading-none">&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Article Stats Card */}
        <div className="relative rounded-2xl overflow-hidden h-48 bg-gray-900 group">
          <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80" alt="Desert Road" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
          <div className="absolute bottom-6 left-6 z-20 text-white">
            <p className="text-xs font-semibold tracking-wide mb-1">Article Available</p>
            <h4 className="font-serif text-4xl font-bold">78</h4>
          </div>
        </div>

      </div>

      {/* Right Column - Large Vertical Card */}
      <div className="relative rounded-2xl overflow-hidden group h-[400px] lg:h-auto bg-gray-900 flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80"
          alt="Coastal Cliffs"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out opacity-90"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-black/30 z-10" />
        
        {/* Content */}
        <div className="relative z-20 text-white text-center px-8 max-w-md">
          <h3 className="font-serif text-3xl font-bold leading-snug drop-shadow-md">
            Beyond accommodation, creating memories of a lifetime
          </h3>
        </div>
      </div>

    </section>
  );
};

export default PromotionalSection;
