'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Hubungi Kami</h1>
          <p className="text-xl text-gray-600">
            Kami siap membantu Anda. Hubungi tim support Jualin kapan saja.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <Card className="p-6 text-center hover:shadow-lg transition">
            <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600 break-all">support@jualin.com</p>
            <p className="text-sm text-gray-500 mt-2">Respon: 1-24 jam</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition">
            <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Telepon</h3>
            <p className="text-gray-600">+62 (0) 800-XXX-XXXX</p>
            <p className="text-sm text-gray-500 mt-2">Senin-Jumat, 09:00-17:00</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition">
            <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Kantor</h3>
            <p className="text-gray-600">Jakarta, Indonesia</p>
            <p className="text-sm text-gray-500 mt-2">Jambi Tech Center</p>
          </Card>
        </div>

        {/* Main Contact Section */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Kirim Pesan</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">✓ Pesan Anda telah terkirim!</p>
                <p className="text-sm text-green-700">
                  Kami akan menghubungi Anda dalam waktu 24 jam.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nama Anda"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Email Anda"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Subjek
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Subjek pesan"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Pesan
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Tulis pesan Anda di sini..."
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Kirim Pesan
              </Button>
            </form>
          </Card>

          {/* Business Hours & FAQ */}
          <div className="space-y-6">
            {/* Business Hours */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-gray-900">Jam Operasional</h3>
              </div>
              <div className="space-y-3 text-gray-600">
                <div className="flex justify-between">
                  <span>Senin - Jumat</span>
                  <span className="font-semibold">09:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sabtu</span>
                  <span className="font-semibold">10:00 - 15:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Minggu</span>
                  <span className="font-semibold text-red-600">Libur</span>
                </div>
              </div>
            </Card>

            {/* FAQ */}
            <Card className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pertanyaan Umum</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-900">Bagaimana cara menghubungi support?</p>
                  <p className="text-gray-600 mt-1">Anda dapat menghubungi melalui email, telepon, atau formulir kontak di atas.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Berapa lama waktu respons?</p>
                  <p className="text-gray-600 mt-1">Biasanya kami merespons dalam waktu 1-24 jam pada jam kerja.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Apakah ada live chat?</p>
                  <p className="text-gray-600 mt-1">Fitur live chat akan segera tersedia. Saat ini gunakan email atau telepon.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
