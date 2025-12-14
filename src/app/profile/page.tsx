'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserPreferencesStore, useSavedItemsStore, useSearchStore } from '@/store';
import Button from '@/components/ui/Button';
import { STYLE_AESTHETICS, SIZE_CONVERSION } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const {
    region,
    setRegion,
    sizes,
    setSizes,
    favoriteBrands,
    stylePreferences,
    setStylePreferences,
    showInternationalListings,
    setShowInternationalListings,
  } = useUserPreferencesStore();

  const { savedItems, collections, priceAlerts } = useSavedItemsStore();
  const { clearHistory, searchHistory } = useSearchStore();

  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* User Stats */}
        <div className="bg-white rounded-xl p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{savedItems.length}</p>
              <p className="text-sm text-gray-500">Saved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{collections.length}</p>
              <p className="text-sm text-gray-500">Collections</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{priceAlerts.length}</p>
              <p className="text-sm text-gray-500">Alerts</p>
            </div>
          </div>
        </div>

        {/* Region & Currency */}
        <SettingsSection
          title="Region & Currency"
          isOpen={activeSection === 'region'}
          onToggle={() => setActiveSection(activeSection === 'region' ? null : 'region')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Region
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setRegion('US')}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-center font-medium transition-colors',
                    region === 'US'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  🇺🇸 United States (USD)
                </button>
                <button
                  onClick={() => setRegion('UK')}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-center font-medium transition-colors',
                    region === 'UK'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  🇬🇧 United Kingdom (GBP)
                </button>
              </div>
            </div>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Show international listings</span>
              <input
                type="checkbox"
                checked={showInternationalListings}
                onChange={(e) => setShowInternationalListings(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300"
              />
            </label>
          </div>
        </SettingsSection>

        {/* Sizes */}
        <SettingsSection
          title="Your Sizes"
          isOpen={activeSection === 'sizes'}
          onToggle={() => setActiveSection(activeSection === 'sizes' ? null : 'sizes')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tops</label>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSizes({ ...sizes, tops: size })}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      sizes.tops === size
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bottoms</label>
              <div className="flex flex-wrap gap-2">
                {['24', '25', '26', '27', '28', '29', '30', '31', '32', '34'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSizes({ ...sizes, bottoms: size })}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      sizes.bottoms === size
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shoes</label>
              <div className="flex flex-wrap gap-2">
                {['5', '6', '7', '8', '9', '10', '11', '12'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSizes({ ...sizes, shoes: size })}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      sizes.shoes === size
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Style Preferences */}
        <SettingsSection
          title="Style Preferences"
          isOpen={activeSection === 'style'}
          onToggle={() => setActiveSection(activeSection === 'style' ? null : 'style')}
        >
          <p className="text-sm text-gray-500 mb-4">
            Select the aesthetics that match your style
          </p>
          <div className="flex flex-wrap gap-2">
            {STYLE_AESTHETICS.map((style) => (
              <button
                key={style.id}
                onClick={() => {
                  const newPrefs = stylePreferences.includes(style.id)
                    ? stylePreferences.filter((s) => s !== style.id)
                    : [...stylePreferences, style.id];
                  setStylePreferences(newPrefs);
                }}
                className={cn(
                  'px-3 py-2 rounded-full text-sm font-medium transition-colors',
                  stylePreferences.includes(style.id)
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {style.label}
              </button>
            ))}
          </div>
        </SettingsSection>

        {/* Data & Privacy */}
        <SettingsSection
          title="Data & Privacy"
          isOpen={activeSection === 'data'}
          onToggle={() => setActiveSection(activeSection === 'data' ? null : 'data')}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Search History</p>
                <p className="text-sm text-gray-500">{searchHistory.length} searches</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Clear all search history?')) {
                    clearHistory();
                  }
                }}
              >
                Clear
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                Your data is stored locally on your device. We don&apos;t share your
                personal information with third parties.
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* About */}
        <div className="bg-white rounded-xl p-4">
          <h2 className="font-bold text-gray-900 mb-4">About ThriftFinder</h2>
          <p className="text-sm text-gray-500 mb-4">
            ThriftFinder helps you discover the best deals on secondhand fashion
            across multiple platforms. We aggregate listings from Depop, Poshmark,
            eBay, Vinted, and more to help you find exactly what you&apos;re looking for.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Help</a>
          </div>
          <p className="text-xs text-gray-400 mt-4">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}

interface SettingsSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function SettingsSection({ title, isOpen, onToggle, children }: SettingsSectionProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center justify-between"
      >
        <h2 className="font-bold text-gray-900">{title}</h2>
        <svg
          className={cn('w-5 h-5 text-gray-400 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
