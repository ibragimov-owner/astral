import React, { useState } from "react";
import { User, Mail, Calendar, Save, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

interface ProfileProps {
  t: any;
  profile: {
    fullName: string;
    email: string;
    birthDate: string;
  };
  onSave: (data: any) => void;
}

export const Profile: React.FC<ProfileProps> = ({ t, profile, onSave }) => {
  const [formData, setFormData] = useState(profile);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-10">
      <div className="space-y-2">
        <h2 className="text-4xl font-black">{t.profile}</h2>
        <p className="opacity-50">Manage your cosmic identity and personal data.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 px-1">
              <User className="w-4 h-4 text-[#66fcf1]" />
              {t.fullName}
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#66fcf1]/20 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 px-1">
              <Mail className="w-4 h-4 text-[#66fcf1]" />
              {t.email}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#66fcf1]/20 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 px-1">
              <Calendar className="w-4 h-4 text-[#66fcf1]" />
              {t.birthDate}
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#66fcf1]/20 outline-none transition-all color-scheme-dark"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-[#66fcf1] text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#66fcf1]/20"
        >
          {saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? "Saved" : t.saveChanges}
        </button>
      </form>
    </div>
  );
};
