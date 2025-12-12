'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle, ChevronLeft } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailUpdates: true,
    emailPromotions: false,
    smsOrders: false,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    showOrderHistory: false,
    allowMessages: true,
  });

  const [twoFactor, setTwoFactor] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back Button */}
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your preferences and security settings</p>
      </div>

      {/* Success Message */}
      {saved && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <AlertDescription className="text-green-800">
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

            <div className="space-y-5">
              {/* Email Notifications */}
              <div className="border-b pb-5">
                <h3 className="font-semibold text-gray-900 mb-4">Email Notifications</h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="emailOrders"
                      checked={notifications.emailOrders}
                      onCheckedChange={() => handleNotificationChange('emailOrders')}
                    />
                    <label htmlFor="emailOrders" className="cursor-pointer flex-1">
                      <div className="font-semibold text-gray-900">Order Updates</div>
                      <div className="text-sm text-gray-600">Get notified about order status changes</div>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="emailUpdates"
                      checked={notifications.emailUpdates}
                      onCheckedChange={() => handleNotificationChange('emailUpdates')}
                    />
                    <label htmlFor="emailUpdates" className="cursor-pointer flex-1">
                      <div className="font-semibold text-gray-900">Product Updates</div>
                      <div className="text-sm text-gray-600">New products and features</div>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="emailPromotions"
                      checked={notifications.emailPromotions}
                      onCheckedChange={() => handleNotificationChange('emailPromotions')}
                    />
                    <label htmlFor="emailPromotions" className="cursor-pointer flex-1">
                      <div className="font-semibold text-gray-900">Promotions & Deals</div>
                      <div className="text-sm text-gray-600">Special offers and discounts</div>
                    </label>
                  </div>
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="pt-5">
                <h3 className="font-semibold text-gray-900 mb-4">SMS Notifications</h3>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="smsOrders"
                    checked={notifications.smsOrders}
                    onCheckedChange={() => handleNotificationChange('smsOrders')}
                  />
                  <label htmlFor="smsOrders" className="cursor-pointer flex-1">
                    <div className="font-semibold text-gray-900">Order Updates</div>
                    <div className="text-sm text-gray-600">Critical order updates via SMS</div>
                  </label>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
              Save Preferences
            </Button>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Privacy Settings</h2>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="profilePublic"
                  checked={privacy.profilePublic}
                  onCheckedChange={() => handlePrivacyChange('profilePublic')}
                />
                <label htmlFor="profilePublic" className="cursor-pointer flex-1">
                  <div className="font-semibold text-gray-900">Public Profile</div>
                  <div className="text-sm text-gray-600">Allow others to view your profile</div>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="showOrderHistory"
                  checked={privacy.showOrderHistory}
                  onCheckedChange={() => handlePrivacyChange('showOrderHistory')}
                />
                <label htmlFor="showOrderHistory" className="cursor-pointer flex-1">
                  <div className="font-semibold text-gray-900">Show Order History</div>
                  <div className="text-sm text-gray-600">Display your purchase history publicly</div>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="allowMessages"
                  checked={privacy.allowMessages}
                  onCheckedChange={() => handlePrivacyChange('allowMessages')}
                />
                <label htmlFor="allowMessages" className="cursor-pointer flex-1">
                  <div className="font-semibold text-gray-900">Allow Messages</div>
                  <div className="text-sm text-gray-600">Accept messages from other users</div>
                </label>
              </div>
            </div>

            <Button onClick={handleSave} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
              Save Privacy Settings
            </Button>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>

            <div className="space-y-6">
              {/* Password Section */}
              <div className="border-b pb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Password</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Last changed 3 months ago. Change your password regularly for security.
                </p>
                <Button variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                  Change Password
                </Button>
              </div>

              {/* Two-Factor Authentication */}
              <div className="border-b pb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Two-Factor Authentication</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Add an extra layer of security to your account with two-factor authentication.
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <Checkbox
                    id="twoFactor"
                    checked={twoFactor}
                    onCheckedChange={(checked) => setTwoFactor(checked as boolean)}
                  />
                  <label htmlFor="twoFactor" className="cursor-pointer">
                    <div className="font-semibold text-gray-900">Enable 2FA</div>
                    <div className="text-sm text-gray-600">Require verification code on login</div>
                  </label>
                </div>
                {twoFactor && (
                  <Button variant="outline" className="border-2 border-green-600 text-green-600 hover:bg-green-50">
                    Setup Authentication App
                  </Button>
                )}
              </div>

              {/* Active Sessions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Active Sessions</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Manage your active sessions on different devices.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Chrome on Windows</p>
                      <p className="text-sm text-gray-600">192.168.1.1 • Active now</p>
                    </div>
                    <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      Logout
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Safari on iPhone</p>
                      <p className="text-sm text-gray-600">192.168.1.2 • Last active 2 hours ago</p>
                    </div>
                    <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200 bg-red-50">
        <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h2>
        <p className="text-gray-700 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button className="bg-red-600 hover:bg-red-700 text-white">Delete Account</Button>
      </Card>
    </div>
  );
}
