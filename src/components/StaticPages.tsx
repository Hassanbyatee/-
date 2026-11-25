import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Clock, Mail, Phone } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { submitComplaint } from '../services/platformService';
import type { Complaint } from '../types/domain';
import type { AppView } from './Navbar';

interface StaticPageProps {
  page: 'privacy' | 'terms' | 'cancellation' | 'contact';
  onBack: (view: AppView) => void;
  onOpenAuth: () => void;
}

export const StaticPages: React.FC<StaticPageProps> = ({ page, onBack, onOpenAuth }) => {
  const { dir, t } = useI18n();
  const { firebaseUser, userProfile, settings } = useAuth();

  const [category, setCategory] = useState<Complaint['category']>('app_issue');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [sent, setSent] = useState(false);

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !userProfile) {
      onOpenAuth();
      return;
    }
    await submitComplaint({
      userId: firebaseUser.uid,
      userName: userProfile.displayName,
      userRole: userProfile.role === 'driver' ? 'driver' : 'passenger',
      category,
      subject,
      description,
    });
    setSubject('');
    setDescription('');
    setSent(true);
  };

  if (page === 'contact') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <button
          type="button"
          onClick={() => onBack('home')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#0770E3] transition-colors cursor-pointer"
        >
          <BackIcon className="w-4 h-4" />
          <span>{t.legal.backHome}</span>
        </button>

        <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t.legal.contactTitle}</h1>
            <p className="text-sm text-slate-600 mt-2">{t.legal.contactDesc}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0770E3]" />
                <span>{t.admin.supportPhoneLabel}</span>
              </div>
              <div className="text-sm font-semibold font-mono text-slate-900 tabular-nums" dir="ltr">
                {settings.supportPhone || '+964 770 000 4455'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#0770E3]" />
                <span>{t.admin.supportEmailLabel}</span>
              </div>
              <div className="text-sm font-semibold text-slate-900" dir="ltr">
                {settings.supportEmail || 'support@masar-iraq.iq'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0770E3]" />
                <span>{t.map.hours}</span>
              </div>
              <div className="text-sm font-medium text-slate-900">{t.legal.workingHours}</div>
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">{t.passenger.submitComplaintTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.passenger.complaintCategory}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Complaint['category'])}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#0770E3]"
                >
                  <option value="app_issue">{t.supportCategories.app_issue}</option>
                  <option value="payment">{t.supportCategories.payment}</option>
                  <option value="driver_behavior">{t.supportCategories.driver_behavior}</option>
                  <option value="vehicle">{t.supportCategories.vehicle}</option>
                  <option value="other">{t.supportCategories.other}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.passenger.complaintSubject}
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={140}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#0770E3]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.passenger.complaintDesc}
              </label>
              <textarea
                rows={4}
                required
                minLength={4}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#0770E3]"
              />
            </div>

            {sent && (
              <div className="text-sm text-[#0770E3] bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-4 py-2.5 font-medium">
                {t.driver.savedSuccess}
              </div>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0770E3] text-white text-sm font-semibold rounded-lg hover:bg-[#0559B8] transition-colors cursor-pointer"
            >
              {firebaseUser ? t.passenger.sendComplaint : t.nav.signIn}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const content =
    page === 'privacy'
      ? { title: t.legal.privacyTitle, paragraphs: t.legal.privacyBody }
      : page === 'terms'
      ? { title: t.legal.termsTitle, paragraphs: t.legal.termsBody }
      : { title: t.legal.cancellationTitle, paragraphs: t.legal.cancellationBody };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <button
        type="button"
        onClick={() => onBack('home')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#0770E3] transition-colors cursor-pointer"
      >
        <BackIcon className="w-4 h-4" />
        <span>{t.legal.backHome}</span>
      </button>

      <article className="surface-card rounded-2xl p-6 sm:p-8 space-y-5">
        <h1 className="text-2xl font-bold text-slate-900">{content.title}</h1>
        <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
          {content.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </article>
    </div>
  );
};
