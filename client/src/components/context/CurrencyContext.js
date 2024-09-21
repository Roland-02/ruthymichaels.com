import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('GBP');
  const [exchangeRates, setExchangeRates] = useState({});

  // Fetch exchange rates
  const fetchExchangeRates = async () => {
    try {
      // get xchange rate from gbp to usd,euro
      const response = await axios.get(`https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_Oad7DA7QkyNFQbay3QlUjenjYwMeTbtFkn8OFxSj&currencies=EUR%2CUSD&base_currency=GBP`);

      // Extract and round the rates
      const rates = response.data.data;
      const eurRate = (rates.EUR).toFixed(2);
      const usdRate = (rates.USD).toFixed(2);

      console.log(`EUR Rate: ${eurRate}`);
      console.log(`USD Rate: ${usdRate}`);

      // Optionally store the rates in local storage or state
      localStorage.setItem('exchangeRates', JSON.stringify({ EUR: eurRate, USD: usdRate }));
      localStorage.setItem('lastFetch', Date.now());

    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };


  // Check and load exchange rates from localStorage
  useEffect(() => {
    const storedRates = JSON.parse(localStorage.getItem('exchangeRates'));
    const lastFetch = localStorage.getItem('lastFetch');

    if (storedRates && lastFetch) {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      if (now - lastFetch < oneDay) {
        // Use stored rates if it's less than a day old
        setExchangeRates(storedRates);
      } else {
        // Fetch new rates
        fetchExchangeRates();
      }
    } else {
      // If no stored rates, fetch new rates
      fetchExchangeRates();
    }
  }, []);

  // Get currency from localStorage or Geolocation
  useEffect(() => {
    const storedCurrency = localStorage.getItem('currency');
    if (storedCurrency) {
      setCurrency(storedCurrency);
      return;
    }

    const fetchGeolocation = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/');
        const countryCode = response.data.country_code;
        const currencyMap = {
          US: 'USD',
          GB: 'GBP',
          EU: 'EUR',
        };
        const detectedCurrency = currencyMap[countryCode] || 'GBP';
        setCurrency(detectedCurrency);
        localStorage.setItem('currency', detectedCurrency);
      } catch (error) {
        console.error('Error fetching geolocation:', error);
        setCurrency('GBP'); // Default to GBP if API fails
      }
    };

    fetchGeolocation();
  }, []);

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency); // Update localStorage with new currency
  };

  return (
    <CurrencyContext.Provider value={{ currency, exchangeRates, changeCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
