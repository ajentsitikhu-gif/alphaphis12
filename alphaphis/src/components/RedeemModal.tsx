import React, { useState } from 'react';
import { X, Lock, ShieldCheck, User, Mail, Phone, Calendar, AlertCircle, Award, Eye, EyeOff } from 'lucide-react';
import { Prize, UserSubmission } from '../types';
import { evaluateSubmission, parseEuropeanDate } from '../utils/validation';
import { saveSubmission } from '../utils/storage';

interface RedeemModalProps {
  isOpen: boolean;
  prize: Prize | null;
  onClose: () => void;
  onSubmitted: (submission: UserSubmission) => void;
}

export const RedeemModal: React.FC<RedeemModalProps> = ({
  isOpen,
  prize,
  onClose,
  onSubmitted,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !prize) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = evaluateSubmission({
      email,
      password,
      confirmPassword,
      phone,
      dob,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    // Save to storage
    const newRecord = saveSubmission({
      name: name.trim(),
      email: email.trim(),
      phone: `+977${phone}`,
      dob: parseEuropeanDate(dob),
      prize: prize.name,
      status: validation.status,
      calculatedAge: validation.calculatedAge,
      flagReason: validation.flagReason,
      riskScore: 'Critical',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhone('');
      setDob('');
      setErrors({});
      onClose();
      onSubmitted(newRecord);
    }, 400);
  };

  return (
    <div
      id="redeem-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="redeem-modal-container"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* University-style header bar for the educational simulation */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 px-3 py-2.5 text-white flex items-start justify-between gap-3 sm:px-4 sm:py-3">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            <div className="w-7 h-7 shrink-0 rounded-md bg-white/15 flex items-center justify-center border border-white/20">
              <Award className="w-3.5 h-3.5 text-yellow-300" />
            </div>
            <div className="min-w-0 pt-0.5">
              <h2 className="text-[13px] font-black leading-tight tracking-tight break-words sm:text-[14px]">
                Student Prize Claim Portal
              </h2>
              <p className="mt-0.5 text-[9px] leading-tight text-blue-200 sm:text-[10px]">
                Official Verification & Identity Confirmation
              </p>
            </div>
          </div>
          <button
            id="close-redeem-modal-btn"
            onClick={onClose}
            className="shrink-0 text-white/70 hover:text-white hover:bg-white/10 p-1 rounded-md transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prize Confirmation Highlight Card */}
        <div className="bg-amber-50/80 border-b border-amber-200/80 px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl leading-none">🎁</span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                Claiming Prize:
              </p>
              <p className="text-[12px] font-extrabold text-amber-950 truncate">
                {prize.name} ({prize.tagline})
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap">
            ✓ Reserved
          </span>
        </div>

        {/* The Deceptive Form (Phishing Trap) */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-2 text-[11px] text-amber-900 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug font-medium text-amber-900">
              To prevent fraudulent bots, please authenticate with your university email and campus credentials.
            </p>
          </div>

          {/* Name Field */}
          <div>
            <label
              htmlFor="field-name"
              className="block text-xs font-semibold text-neutral-700 mb-1"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="field-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="field-email"
              className="block text-xs font-semibold text-neutral-700 mb-1"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="field-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="student@university.edu"
                className={`w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border bg-white text-neutral-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-neutral-300 focus:border-blue-600 focus:ring-blue-100'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field - Phishing Red Flag Trap */}
          <div>
            <label
              htmlFor="field-password"
              className="block text-xs font-semibold text-neutral-700 mb-1"
            >
              Enter your password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="field-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="Create your password"
                className={`w-full pl-9 pr-10 py-1.5 text-sm rounded-lg border bg-white text-neutral-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-neutral-300 focus:border-blue-600 focus:ring-blue-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.password}
              </p>
            )}
            <p className="text-xs text-amber-700 mt-1">
              Remember your password, it is necessary to redeem your reward later.
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="field-confirm-password"
              className="block text-xs font-semibold text-neutral-700 mb-1"
            >
              Confirm your password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="field-confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                placeholder="Re-enter your password"
                className={`w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border bg-white text-neutral-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-neutral-300 focus:border-blue-600 focus:ring-blue-100'
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Phone Number Field */}
          <div>
            <label
              htmlFor="field-phone"
              className="block text-xs font-semibold text-neutral-700 mb-1"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <div className="flex items-center px-2.5 rounded-l-lg border border-r-0 border-neutral-300 bg-neutral-50 text-sm font-semibold text-neutral-700">
                +977
              </div>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Phone className="w-4 h-4" />
                </div>
                <input
                  id="field-phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  placeholder="98XXXXXXXX"
                  className={`w-full pl-9 pr-3 py-1.5 text-sm rounded-r-lg border bg-white text-neutral-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.phone
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-neutral-300 focus:border-blue-600 focus:ring-blue-100'
                  }`}
                />
              </div>
            </div>
            {errors.phone && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* DOB Field */}
          <div>
            <label
              htmlFor="field-dob"
              className="block text-xs font-semibold text-neutral-700 mb-1"
            >
              Date of Birth (Eligibility Check) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="field-dob"
                type="text"
                required
                value={dob}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                  const formattedDob = digits.length > 4
                    ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
                    : digits.length > 2
                      ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                      : digits;
                  setDob(formattedDob);
                  if (errors.dob) setErrors((prev) => ({ ...prev, dob: '' }));
                }}
                placeholder="DD/MM/YYYY"
                inputMode="numeric"
                pattern="\d{2}/\d{2}/\d{4}"
                className={`w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border bg-white text-neutral-900 focus:outline-none focus:ring-2 transition-all ${
                  errors.dob
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-neutral-300 focus:border-blue-600 focus:ring-blue-100'
                }`}
              />
            </div>
            {errors.dob && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.dob}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              id="cancel-redeem-btn"
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-redeem-form-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Claim...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verify Identity & Claim</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
