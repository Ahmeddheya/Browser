import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CurrencyRate {
  code: string;
  symbol: string;
  rate: number;
  change: number;
}

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export const CurrencyWidget: React.FC = () => {
  const [currencies] = useState<CurrencyRate[]>([
    { code: 'USD', symbol: '$', rate: 1.00, change: 0.0 },
    { code: 'EUR', symbol: '€', rate: 0.92, change: -0.1 },
    { code: 'GBP', symbol: '£', rate: 0.79, change: 0.2 },
  ]);

  const [cryptos] = useState<CryptoPrice[]>([
    { symbol: 'BTC', name: 'Bitcoin', price: 43250, change: 2.5 },
    { symbol: 'ETH', name: 'Ethereum', price: 2280, change: -1.2 },
  ]);

  return (
    <View style={styles.container}>
      {/* Currency Rates */}
      <View style={styles.section}>
        <View style={styles.currencyGrid}>
          {currencies.map((currency, index) => (
            <TouchableOpacity key={index} style={styles.currencyCard}>
              <Text style={styles.currencySymbol}>{currency.symbol}</Text>
              <Text style={styles.currencyCode}>{currency.code}</Text>
              <Text style={styles.currencyRate}>{currency.rate.toFixed(2)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Crypto Prices */}
      <View style={styles.section}>
        <View style={styles.cryptoGrid}>
          {cryptos.map((crypto, index) => (
            <TouchableOpacity key={index} style={styles.cryptoCard}>
              <View style={styles.cryptoHeader}>
                <View style={styles.cryptoIcon}>
                  <Ionicons 
                    name={crypto.symbol === 'BTC' ? 'logo-bitcoin' : 'diamond-outline'} 
                    size={20} 
                    color={crypto.symbol === 'BTC' ? '#f7931a' : '#627eea'} 
                  />
                </View>
                <Text style={styles.cryptoSymbol}>{crypto.symbol}</Text>
              </View>
              <Text style={styles.cryptoName}>{crypto.name}</Text>
              <Text style={styles.cryptoPrice}>${crypto.price.toLocaleString()}</Text>
              <Text style={[
                styles.cryptoChange, 
                { color: crypto.change >= 0 ? '#4CAF50' : '#f44336' }
              ]}>
                {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(1)}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  currencyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currencyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4285f4',
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  currencyRate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  cryptoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cryptoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cryptoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cryptoIcon: {
    marginRight: 6,
  },
  cryptoSymbol: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cryptoName: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  cryptoPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  cryptoChange: {
    fontSize: 12,
    fontWeight: '500',
  },
});