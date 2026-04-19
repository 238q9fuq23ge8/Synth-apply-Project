"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type CountryCurrency = { code: string; symbol: string; flag: string };
type CountryMap = Record<string, CountryCurrency>;

export const COUNTRY_MAP: CountryMap = {
  "Australia": { code: "AUD", symbol: "A$", flag: "🇦🇺" },
  "Austria": { code: "EUR", symbol: "€", flag: "🇦🇹" },
  "Belgium": { code: "EUR", symbol: "€", flag: "🇧🇪" },
  "Brazil": { code: "BRL", symbol: "R$", flag: "🇧🇷" },
  "Canada": { code: "CAD", symbol: "CA$", flag: "🇨🇦" },
  "France": { code: "EUR", symbol: "€", flag: "🇫🇷" },
  "Germany": { code: "EUR", symbol: "€", flag: "🇩🇪" },
  "India": { code: "INR", symbol: "₹", flag: "🇮🇳" },
  "Italy": { code: "EUR", symbol: "€", flag: "🇮🇹" },
  "Mexico": { code: "MXN", symbol: "MX$", flag: "🇲🇽" },
  "Netherlands": { code: "EUR", symbol: "€", flag: "🇳🇱" },
  "New Zealand": { code: "NZD", symbol: "NZ$", flag: "🇳🇿" },
  "Poland": { code: "PLN", symbol: "zł", flag: "🇵🇱" },
  "South Africa": { code: "ZAR", symbol: "R", flag: "🇿🇦" },
  "United Kingdom": { code: "GBP", symbol: "£", flag: "🇬🇧" },
  "United States": { code: "USD", symbol: "$", flag: "🇺🇸" },
  "Pakistan": { code: "PKR", symbol: "₨", flag: "🇵🇰" },
  "United Arab Emirates": { code: "AED", symbol: "د.إ", flag: "🇦🇪" },
  "Saudi Arabia": { code: "SAR", symbol: "﷼", flag: "🇸🇦" },
  "Singapore": { code: "SGD", symbol: "S$", flag: "🇸🇬" },
  "Japan": { code: "JPY", symbol: "¥", flag: "🇯🇵" },
  "Turkey": { code: "TRY", symbol: "₺", flag: "🇹🇷" },
  "Switzerland": { code: "CHF", symbol: "CHF", flag: "🇨🇭" },
  "Bangladesh": { code: "BDT", symbol: "৳", flag: "🇧🇩" },
  "Indonesia": { code: "IDR", symbol: "Rp", flag: "🇮🇩" },
  "Malaysia": { code: "MYR", symbol: "RM", flag: "🇲🇾" },
  "Qatar": { code: "QAR", symbol: "﷼", flag: "🇶🇦" },
  "Kuwait": { code: "KWD", symbol: "KD", flag: "🇰🇼" },
  "Nigeria": { code: "NGN", symbol: "₦", flag: "🇳🇬" },
  "Egypt": { code: "EGP", symbol: "E£", flag: "🇪🇬" },
  "Kenya": { code: "KES", symbol: "KSh", flag: "🇰🇪" },
  "China": { code: "CNY", symbol: "¥", flag: "🇨🇳" },
  "Philippines": { code: "PHP", symbol: "₱", flag: "🇵🇭" },
  "Vietnam": { code: "VND", symbol: "₫", flag: "🇻🇳" },
};

interface CurrencyContextProps {
  country: string;
  setCountry: (c: string) => void;
  convert: (aedAmount: number) => string;
  rate: number;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState("United Arab Emirates");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [rate, setRate] = useState(1);

  // ✅ Load selected country
  useEffect(() => {
    const saved = localStorage.getItem("selected_country");
    if (saved && COUNTRY_MAP[saved]) setCountryState(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("selected_country", country);
  }, [country]);

  // ✅ Fetch AED-based conversion rates
  useEffect(() => {
    const cached = localStorage.getItem("exchange_rates_aed");
    const cachedTime = localStorage.getItem("exchange_time_aed");
    const now = Date.now();

    if (cached && cachedTime && now - parseInt(cachedTime) < 86400000) {
      setRates(JSON.parse(cached));
      return;
    }

    fetch("https://open.er-api.com/v6/latest/AED")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.rates) {
          setRates(data.rates);
          localStorage.setItem("exchange_rates_aed", JSON.stringify(data.rates));
          localStorage.setItem("exchange_time_aed", String(now));
        }
      })
      .catch((err) => console.error("Exchange rate fetch failed:", err));
  }, []);

  // ✅ Update conversion rate when country changes
  useEffect(() => {
    const code = COUNTRY_MAP[country]?.code || "AED";
    const newRate = rates[code] || 1;
    setRate(newRate);
  }, [country, rates]);

  const setCountry = (val: string) => {
    setCountryState(val);
    localStorage.setItem("selected_country", val);
  };

  // ✅ Convert from AED to selected currency
  const convert = (aed: number) => {
    const { symbol } = COUNTRY_MAP[country] || { symbol: "د.إ" };
    const converted = aed * rate;
    const formatted =
      converted > 1000
        ? converted.toLocaleString(undefined, { maximumFractionDigits: 0 })
        : converted.toFixed(2);
    return `${symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{ country, setCountry, convert, rate }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
