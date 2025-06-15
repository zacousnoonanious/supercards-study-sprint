
import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const I18nTester: React.FC = () => {
  const { t, language, setLanguage } = useI18n();

  // Define available languages with the correct Chinese codes
  const availableLanguages = ['en', 'zh-CN', 'zh-TW', 'hi', 'es', 'fr', 'ar', 'pt', 'ru'];

  const testKeys = [
    'welcome',
    'nav.dashboard',
    'nav.decks',
    'decks.title',
    'setView.front',
    'setView.back',
    'editor.toolbar.text',
    'study.title',
    'lang.en',
    'lang.es',
    'lang.fr'
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{t('i18nTester.title')}</CardTitle>
        <div className="flex items-center gap-2">
          <span>{t('i18nTester.currentLanguage')}</span>
          <Badge variant="secondary">{language}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language Switcher */}
        <div className="space-y-2">
          <h4 className="font-medium">{t('i18nTester.availableLanguages')}</h4>
          <div className="flex flex-wrap gap-2">
            {availableLanguages.map((lang) => (
              <Button
                key={lang}
                variant={language === lang ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  console.log(`Switching to language: ${lang}`);
                  setLanguage(lang);
                }}
              >
                {lang === 'zh-CN' ? 'ZH-CN' : lang === 'zh-TW' ? 'ZH-TW' : lang.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Test Translations */}
        <div className="space-y-2">
          <h4 className="font-medium">{t('i18nTester.testTranslations')}</h4>
          <div className="space-y-1 text-sm">
            {testKeys.map((key) => {
              const translation = t(key);
              console.log(`Translation for ${key} in ${language}:`, translation);
              return (
                <div key={key} className="flex justify-between p-2 bg-muted rounded">
                  <code className="text-xs text-muted-foreground">{key}:</code>
                  <span className="font-medium">{translation}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Debug Info */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-medium">{t('i18nTester.debugInfo')}</h4>
          <div className="text-xs space-y-1">
            <div>{t('i18nTester.language')} {JSON.stringify(language)}</div>
            <div>{t('i18nTester.availableLanguages')} {JSON.stringify(availableLanguages)}</div>
            <div>{t('i18nTester.sampleTranslationTest')} {t('welcome') || t('i18nTester.notFound')}</div>
            <div>{t('i18nTester.chineseSimplifiedTest')} {language === 'zh-CN' ? t('welcome') : t('i18nTester.notInZhCnMode')}</div>
            <div>{t('i18nTester.chineseTraditionalTest')} {language === 'zh-TW' ? t('welcome') : t('i18nTester.notInZhTwMode')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
