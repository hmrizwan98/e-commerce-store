export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export interface TimezoneOption {
  value: string;
  label: string;
}

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
];

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: "PKR", name: "Pakistani Rupee", symbol: "Rs." },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "AED", name: "UAE Dirham", symbol: "AED" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$" },
  { code: "AUD", name: "Australian Dollar", symbol: "$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "QAR", name: "Qatari Riyal", symbol: "QAR" },
  { code: "OMR", name: "Omani Rial", symbol: "OMR" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "KWD" },
  { code: "BHD", name: "Bahraini Dinar", symbol: "BHD" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "SGD", name: "Singapore Dollar", symbol: "$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
];

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: "Asia/Karachi", label: "Asia/Karachi (PKT - GMT+5)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time - GMT+0)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST - GMT+4)" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh (AST - GMT+3)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST - GMT+0)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET - GMT+1)" },
  { value: "America/New_York", label: "America/New_York (EST - GMT-5)" },
  { value: "America/Chicago", label: "America/Chicago (CST - GMT-6)" },
  { value: "America/Denver", label: "America/Denver (MST - GMT-7)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST - GMT-8)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST - GMT+5:30)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT - GMT+8)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST - GMT+9)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST - GMT+10)" },
  { value: "Asia/Qatar", label: "Asia/Qatar (AST - GMT+3)" },
];
