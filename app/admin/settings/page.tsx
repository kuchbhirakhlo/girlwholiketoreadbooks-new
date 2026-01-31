'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Globe, 
  Palette, 
  Bell, 
  Shield, 
  Save, 
  ExternalLink,
  Moon,
  Sun,
  BookOpen
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState(' girlwholiketoreadbooks ');
  const [siteDescription, setSiteDescription] = useState('Discover thoughtful book reviews from readers worldwide.');
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  const themes = [
    { value: 'light', label: 'Light', icon: Sun, bg: 'bg-white', text: 'text-[#2B2B2B]' },
    { value: 'dark', label: 'Dark', icon: Moon, bg: 'bg-[#121212]', text: 'text-[#EAEAEA]' },
    { value: 'sepia', label: 'Sepia', icon: BookOpen, bg: 'bg-[#F5E6D3]', text: 'text-[#5C4B3A]' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#2B2B2B]">Settings</h1>
        <p className="text-[#6F6F6F] mt-1">Configure your book review platform</p>
      </div>

      {/* Site Settings */}
      <Card className="bg-white border-[#E6E1DA]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#8B5E3C]" />
            Site Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="border-[#E6E1DA] focus:border-[#8B5E3C]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <textarea
              id="siteDescription"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-[#E6E1DA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C]"
            />
          </div>
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-sm text-[#6F6F6F]">
              <ExternalLink className="w-4 h-4" />
              <a href="/" target="_blank" className="hover:text-[#8B5E3C]">
                View live site
              </a>
            </div>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-[#8B5E3C] text-white hover:bg-[#8B5E3C]/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="bg-white border-[#E6E1DA]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#8B5E3C]" />
            Reading Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#6F6F6F] mb-4">Choose the default reading theme for readers</p>
          <div className="grid grid-cols-3 gap-4">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value as any)}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${theme === t.value 
                    ? 'border-[#8B5E3C] bg-[#8B5E3C]/5' 
                    : 'border-[#E6E1DA] hover:border-[#8B5E3C]/50'
                  }
                `}
              >
                <div className={`
                  w-full h-16 rounded mb-2 flex items-center justify-center
                  ${t.bg}
                `}>
                  <t.icon className={`w-6 h-6 ${t.text}`} />
                </div>
                <p className="font-medium text-[#2B2B2B] text-sm">{t.label}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-white border-[#E6E1DA]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#8B5E3C]" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-[#2B2B2B]">New review submissions</p>
              <p className="text-sm text-[#6F6F6F]">Get notified when editors submit reviews</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8B5E3C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5E3C]"></div>
            </label>
          </div>
          <Separator className="bg-[#E6E1DA]" />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-[#2B2B2B]">Published reviews digest</p>
              <p className="text-sm text-[#6F6F6F]">Weekly summary of new publications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8B5E3C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5E3C]"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-white border-[#E6E1DA]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#8B5E3C]" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Two-factor authentication</strong> is recommended for admin accounts. 
              Enable it in your Firebase project settings.
            </p>
          </div>
          <div className="p-4 bg-[#FAF8F5] border border-[#E6E1DA] rounded-lg">
            <p className="text-sm text-[#6F6F6F]">
              <strong>Firebase Security Rules</strong> are configured to restrict write access 
              to admin and editor roles only. Review and deploy rules from the Firebase Console.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
