import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import {
  FaQuoteLeft,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";

export default function Testimonials() {
  const testimonials = [
    {
      title: "Great experience",
      text: "As a web developer, I truly appreciate platforms that combine functionality with simplicity. This portal offered a great experience — fast, responsive, and well-organized.",
      name: "Lucas Gray",
      role: "Web Developer",
      img: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5,
    },
    {
      title: "High quality talent",
      text: "I am genuinely impressed with the quality this job portal offers. Every feature is thoughtfully designed and adds real value. We found our lead designer here in 3 days.",
      name: "Aliza Thompson",
      role: "HR Director",
      img: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
    },
    {
      title: "Very useful tool!",
      text: "The portal simplifies the job search process beautifully. Its UI is intuitive, and the performance is top-notch. It's easily the best recruitment tool I've used this year.",
      name: "Ryan Cooper",
      role: "Project Manager",
      img: "https://randomuser.me/api/portraits/men/52.jpg",
      rating: 4,
    },
  ];

  return (
    <section className="bg-[#F8FAFC] py-20 overflow-hidden font-sans border-t border-slate-200/60">
      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[2px] bg-blue-600 rounded-full"></span>
              <span className="text-blue-600 font-bold tracking-widest uppercase text-[10px]">
                Testimonials
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              What the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                Community
              </span>{" "}
              Says
            </h2>
          </div>

          <div className="flex gap-2">
            <button className="prev-btn w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors shadow-sm">
              <FaChevronLeft size={14} />
            </button>
            <button className="next-btn w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors shadow-sm">
              <FaChevronRight size={14} />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={24}
          slidesPerView={2}
          navigation={{ prevEl: ".prev-btn", nextEl: ".next-btn" }}
          pagination={{ clickable: true, el: ".custom-pagination" }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          breakpoints={{
            0: { slidesPerView: 1 },
            1024: { slidesPerView: 2 },
          }}
          className="!pb-12"
        >
          {testimonials.map((item, index) => (
            <SwiperSlide key={index} className="h-auto">
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-[0_4px_15px_-4px_rgba(0,0,0,0.03)] relative h-full flex flex-col justify-between group transition-colors duration-300">
                <FaQuoteLeft className="absolute top-8 right-8 text-slate-100 text-5xl group-hover:text-blue-50 transition-colors duration-300" />

                <div className="relative z-10">
                  <div className="flex gap-1 mb-4 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <FaStar key={i} size={14} />
                    ))}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-base leading-relaxed font-medium">
                    "{item.text}"
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-4 pt-6 border-t border-slate-100">
                  <div className="w-12 h-12 rounded-full border border-slate-200 overflow-hidden shrink-0">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
                      {item.name}
                    </p>
                    <p className="text-[11px] font-bold tracking-wide uppercase text-blue-600 mt-0.5">
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
