import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  isRtl: boolean;
  isActive: boolean;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: string;
}

export class InternationalizationService {
  /**
   * Get all active languages
   */
  static async getLanguages(): Promise<Language[]> {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get all active currencies
   */
  static async getCurrencies(): Promise<Currency[]> {
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get exchange rate
   */
  static async getExchangeRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) return 1;

    const { data, error } = await supabase
      .from('exchange_rates')
      .select('rate')
      .eq('from_currency', fromCurrency)
      .eq('to_currency', toCurrency)
      .eq('is_active', true)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data?.rate || 1;
  }

  /**
   * Convert currency amount
   */
  static async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    const { data, error } = await supabase.rpc('convert_currency', {
      p_amount: amount,
      p_from_currency: fromCurrency,
      p_to_currency: toCurrency,
    });

    if (error) throw error;
    return data || amount;
  }

  /**
   * Get translation
   */
  static async getTranslation(
    key: string,
    languageCode: string = 'en',
    context: string = 'ui'
  ): Promise<string> {
    const { data, error } = await supabase.rpc('get_translation', {
      p_key: key,
      p_language_code: languageCode,
      p_context: context,
    });

    if (error) throw error;
    return data || key;
  }

  /**
   * Get bulk translations
   */
  static async getTranslations(
    keys: string[],
    languageCode: string = 'en'
  ): Promise<Record<string, string>> {
    const { data, error } = await supabase
      .from('translations')
      .select('translation_key, translation_value')
      .eq('language_code', languageCode)
      .in('translation_key', keys);

    if (error) throw error;

    const translations: Record<string, string> = {};
    (data || []).forEach(item => {
      translations[item.translation_key] = item.translation_value;
    });

    // Fill missing keys with key itself
    keys.forEach(key => {
      if (!translations[key]) {
        translations[key] = key;
      }
    });

    return translations;
  }

  /**
   * Get product translation
   */
  static async getProductTranslation(
    productId: string,
    languageCode: string = 'en'
  ): Promise<any> {
    const { data, error } = await supabase.rpc('get_product_translation', {
      p_product_id: productId,
      p_language_code: languageCode,
    });

    if (error) throw error;
    return data?.[0] || null;
  }

  /**
   * Save product translation
   */
  static async saveProductTranslation(
    productId: string,
    languageCode: string,
    translation: {
      name?: string;
      description?: string;
      shortDescription?: string;
      metaTitle?: string;
      metaDescription?: string;
    }
  ): Promise<void> {
    const { error } = await supabase.from('product_translations').upsert(
      {
        product_id: productId,
        language_code: languageCode,
        name: translation.name,
        description: translation.description,
        short_description: translation.shortDescription,
        meta_title: translation.metaTitle,
        meta_description: translation.metaDescription,
      },
      { onConflict: 'product_id,language_code' }
    );

    if (error) throw error;
  }

  /**
   * Get user language preferences
   */
  static async getUserPreferences(userId: string): Promise<{
    languageCode: string;
    currencyCode: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
  }> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return (
      data || {
        languageCode: 'en',
        currencyCode: 'USD',
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
      }
    );
  }

  /**
   * Update user language preferences
   */
  static async updateUserPreferences(
    userId: string,
    preferences: {
      languageCode?: string;
      currencyCode?: string;
      timezone?: string;
      dateFormat?: string;
      timeFormat?: string;
    }
  ): Promise<void> {
    const { error } = await supabase.from('user_preferences').upsert(
      {
        user_id: userId,
        language_code: preferences.languageCode,
        currency_code: preferences.currencyCode,
        timezone: preferences.timezone,
        date_format: preferences.dateFormat,
        time_format: preferences.timeFormat,
      },
      { onConflict: 'user_id' }
    );

    if (error) throw error;
  }

  /**
   * Format currency
   */
  static async formatCurrency(
    amount: number,
    currencyCode: string,
    languageCode: string = 'en'
  ): Promise<string> {
    const { data: currency } = await supabase
      .from('currencies')
      .select('symbol, decimal_places')
      .eq('code', currencyCode)
      .single();

    if (!currency) return `${amount}`;

    const formatted = amount.toFixed(currency.decimal_places);
    return `${currency.symbol}${formatted}`;
  }

  /**
   * Update exchange rates (admin function)
   */
  static async updateExchangeRates(
    rates: Array<{
      fromCurrency: string;
      toCurrency: string;
      rate: number;
    }>
  ): Promise<void> {
    const records = rates.map(r => ({
      from_currency: r.fromCurrency,
      to_currency: r.toCurrency,
      rate: r.rate,
      effective_date: new Date().toISOString().split('T')[0],
      source: 'api',
    }));

    const { error } = await supabase.from('exchange_rates').upsert(records, {
      onConflict: 'from_currency,to_currency,effective_date',
    });

    if (error) throw error;
  }

  /**
   * Detect user language from browser
   */
  static detectBrowserLanguage(): string {
    if (typeof navigator === 'undefined') return 'en';

    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    return browserLang.split('-')[0].toLowerCase();
  }

  /**
   * Get supported language codes
   */
  static async getSupportedLanguageCodes(): Promise<string[]> {
    const languages = await this.getLanguages();
    return languages.map(l => l.code);
  }
}
