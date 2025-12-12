'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Password saat ini diperlukan';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Password baru diperlukan';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password harus minimal 8 karakter';
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword = 'Password harus mengandung huruf besar';
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = 'Password harus mengandung angka';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password diperlukan';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    if (currentPassword === newPassword) {
      newErrors.newPassword = 'Password baru harus berbeda dari yang sekarang';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/account" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Akun
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ubah Password</h1>
          <p className="text-gray-600">Kelola keamanan akun Anda dengan mengubah password secara berkala</p>
        </div>

        <Card className="p-8">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold">✓ Password berhasil diubah</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Password Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan password saat ini"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
              <p className="mt-2 text-xs text-gray-600">
                Password harus minimal 8 karakter, mengandung huruf besar dan angka
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Konfirmasi password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Ubah Password
              </Button>
              <Link href="/account" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Batal
                </Button>
              </Link>
            </div>
          </form>

          {/* Security Tips */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tips Keamanan</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Gunakan password yang kuat dan unik</li>
              <li>• Jangan bagikan password Anda kepada siapa pun</li>
              <li>• Ubah password secara berkala untuk keamanan maksimal</li>
              <li>• Gunakan password yang berbeda untuk setiap akun online</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
