import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import {
  FaQuoteLeft,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Sparkles } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";

export default function Testimonials() {
  const testimonials = [
    {
      title: "Direct Recruiter Access",
      text: "As a senior engineering manager, I appreciate platforms that cut out unnecessary agency spam. JobOne provided direct contact with hiring leads and verified requisition data.",
      name: "Lucas Gray",
      role: "Engineering Manager",
      img: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5,
    },
    {
      title: "High Precision Talent Pipeline",
      text: "We filled our Principal Systems Architect role in under ten business days. Candidates had verified backgrounds and our hiring team avoided duplicate application triage.",
      name: "Aliza Thompson",
      role: "VP of Talent Acquisition",
      img: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
    },
    {
      title: "Transparent Compensation & Status",
      text: "Knowing the exact compensation parameters and real-time status of each submission made my career transition completely seamless. Easily the cleanest portal experience.",
      name: "Ryan Cooper",
      role: "Lead Full-Stack Architect",
      img: "https://randomuser.me/api/portraits/men/52.jpg",
      rating: 5,
    },
  ];

  return (
    <section
      aria-label="Candidate and Employer Reviews"
      className="bg-[var(--theme-bg)] text-[var(--theme-text)] py-20 overflow-hidden font-sans border-t border-[var(--theme-border)] transition-colors duration-150"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-surface-elevated)] border border-[var(--theme-border)] text-xs text-[var(--theme-text-muted)] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[var(--theme-accent-silver)]" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Platform Validation
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--theme-text)] tracking-tight leading-tight">
              Community & Enterprise Trust
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[var(--theme-text-muted)]">
              Direct feedback from professionals and recruiters actively hiring on JobOne.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              aria-label="Previous testimonial"
              className="prev-btn w-10 h-10 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--theme-accent-silver)] cursor-pointer"
            >
              <FaChevronLeft size={13} />
            </button>
            <button
              aria-label="Next testimonial"
              className="next-btn w-10 h-10 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--theme-accent-silver)] cursor-pointer"
            >
              <FaChevronRight size={13} />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={24}
          slidesPerView={2}
          navigation={{ prevEl: ".prev-btn", nextEl: ".next-btn" }}
          pagination={{ clickable: true, el: ".custom-pagination" }}
          autoplay={{ delay: 5500, disableOnInteraction: false }}
          loop
          breakpoints={{
            0: { slidesPerView: 1 },
            1024: { slidesPerView: 2 },
          }}
          className="!pb-12"
        >
          {testimonials.map((item, index) => (
            <SwiperSlide key={index} className="h-auto">
              <div className="bg-[var(--theme-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--theme-border)] hover:border-[var(--theme-border-silver)] shadow-sm relative h-full flex flex-col justify-between group transition-all duration-200">
                <FaQuoteLeft className="absolute top-8 right-8 text-[var(--theme-border)] text-4xl group-hover:text-[var(--theme-border-silver)] transition-colors" />

                <div className="relative z-10">
                  <div className="flex gap-1 mb-4 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <FaStar key={i} size={13} />
                    ))}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--theme-text)] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[var(--theme-text-muted)] text-sm leading-relaxed font-normal">
                    "{item.text}"
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-4 pt-5 border-t border-[var(--theme-border)]">
                  <div className="w-11 h-11 rounded-full border border-[var(--theme-border)] overflow-hidden shrink-0">
                    <img
                      src={item.img}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--theme-text)] text-sm">
                      {item.name}
                    </p>
                    <p className="text-[11px] font-semibold text-[var(--theme-accent-silver)] mt-0.5">
                      {item.role}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="custom-pagination flex justify-center gap-2 mt-2" />
      </div>
    </section>
  );
}
