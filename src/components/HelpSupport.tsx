import React, { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2, Github, Instagram, Send as TelegramIcon, ExternalLink } from "lucide-react";

interface HelpSupportProps {
  t: any;
}

export const HelpSupport: React.FC<HelpSupportProps> = ({ t }) => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log("Contact form submitted:", form);
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contacts = [
    { icon: <TelegramIcon className="w-6 h-6" />, label: t.telegram, value: "@orgibragimov", link: "https://t.me/orgibragimov", color: "text-sky-400" },
    { icon: <Mail className="w-6 h-6" />, label: t.gmail, value: "ibragimovgamer@gmail.com", link: "mailto:ibragimovgamer@gmail.com", color: "text-red-400" },
    { icon: <Instagram className="w-6 h-6" />, label: t.instagram, value: "orgibragimov", link: "https://instagram.com/orgibragimov", color: "text-pink-400" },
    { icon: <Github className="w-6 h-6" />, label: t.github, value: "ibragimov-owner", link: "https://github.com/ibragimov-owner", color: "text-white" },
  ];

  return (
    <div className="space-y-16 max-w-4xl mx-auto py-10">
      <div className="space-y-12">
        <div className="space-y-2">
          <h2 className="text-4xl font-black">{t.help}</h2>
          <p className="opacity-50">Need assistance? Reach out to the ASTRAL team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Form */}
          <section className="space-y-8">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-[#66fcf1]" />
              {t.contactSupport}
            </h3>

            {submitted ? (
              <div className="bg-[#66fcf1]/10 border border-[#66fcf1]/30 p-8 rounded-[2rem] text-center space-y-4">
                <div className="w-16 h-16 bg-[#66fcf1] text-black rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="font-bold text-[#66fcf1]">{t.messageSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  required
                  type="text"
                  placeholder={t.fullName}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#66fcf1]/20 transition-all"
                />
                <input
                  required
                  type="email"
                  placeholder={t.email}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#66fcf1]/20 transition-all"
                />
                <input
                  required
                  type="text"
                  placeholder={t.subject}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#66fcf1]/20 transition-all"
                />
                <textarea
                  required
                  rows={4}
                  placeholder={t.message}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#66fcf1]/20 transition-all resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-4 bg-[#66fcf1] text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                >
                  <Send className="w-4 h-4" />
                  {t.sendMessage}
                </button>
              </form>
            )}
          </section>

          {/* Contact Links */}
          <section className="space-y-8">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <ExternalLink className="w-6 h-6 text-[#66fcf1]" />
              {t.contactTitle}
            </h3>

            <div className="grid gap-4">
              {contacts.map((contact, i) => (
                <a
                  key={i}
                  href={contact.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-3xl hover:border-[#66fcf1]/40 transition-all group"
                >
                  <div className={`p-3 bg-white/5 rounded-2xl ${contact.color}`}>{contact.icon}</div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{contact.label}</p>
                    <p className="font-bold text-lg">{contact.value}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-20 transition-opacity" />
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
