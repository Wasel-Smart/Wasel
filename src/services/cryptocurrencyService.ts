import { supabase } from '../utils/supabase/client';

export type CryptoType = 'BTC' | 'ETH' | 'USDC' | 'USDT';

interface CryptoWallet {
  id: string;
  user_id: string;
  crypto_type: CryptoType;
  wallet_address: string;
  balance: number;
  private_key_encrypted: string;
  created_at: string;
}

interface CryptoTransaction {
  id: string;
  user_id: string;
  crypto_type: CryptoType;
  amount: number;
  usd_value: number;
  transaction_hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'deposit' | 'withdrawal' | 'payment';
  reference_id?: string;
}

interface CryptoPrice {
  BTC: number;
  ETH: number;
  USDC: number;
  USDT: number;
}

class CryptocurrencyService {
  private prices: CryptoPrice = { BTC: 45000, ETH: 3000, USDC: 1, USDT: 1 };

  async getCryptoPrices(): Promise<CryptoPrice> {
    try {
      // Mock API call (use CoinGecko/CoinMarketCap in production)
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,usd-coin,tether&vs_currencies=usd');
      const data = await response.json();
      
      this.prices = {
        BTC: data.bitcoin?.usd || 45000,
        ETH: data.ethereum?.usd || 3000,
        USDC: data['usd-coin']?.usd || 1,
        USDT: data.tether?.usd || 1
      };
    } catch (error) {
      console.error('Failed to fetch crypto prices:', error);
    }
    return this.prices;
  }

  async createCryptoWallet(userId: string, cryptoType: CryptoType): Promise<CryptoWallet> {
    // Generate wallet address (mock - use proper crypto libraries in production)
    const walletAddress = this.generateWalletAddress(cryptoType);
    const privateKey = this.generatePrivateKey();
    
    const wallet = {
      user_id: userId,
      crypto_type: cryptoType,
      wallet_address: walletAddress,
      balance: 0,
      private_key_encrypted: this.encryptPrivateKey(privateKey),
    };

    const { data, error } = await supabase
      .from('crypto_wallets')
      .insert(wallet)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCryptoBalance(userId: string, cryptoType: CryptoType): Promise<number> {
    const { data, error } = await supabase
      .from('crypto_wallets')
      .select('balance')
      .eq('user_id', userId)
      .eq('crypto_type', cryptoType)
      .single();

    if (error) return 0;
    return data?.balance || 0;
  }

  async processCryptoPayment(
    userId: string,
    amount: number,
    cryptoType: CryptoType,
    referenceId: string,
    description: string
  ): Promise<{ success: boolean; transaction_id?: string; error?: string }> {
    try {
      const balance = await this.getCryptoBalance(userId, cryptoType);
      
      if (balance < amount) {
        return { success: false, error: 'Insufficient crypto balance' };
      }

      // Create blockchain transaction (mock)
      const transactionHash = this.generateTransactionHash();
      
      // Update wallet balance
      await this.updateCryptoBalance(userId, cryptoType, -amount);

      // Record transaction
      const transaction = {
        user_id: userId,
        crypto_type: cryptoType,
        amount,
        usd_value: amount * this.prices[cryptoType],
        transaction_hash: transactionHash,
        status: 'confirmed' as const,
        type: 'payment' as const,
        reference_id: referenceId,
      };

      const { data, error } = await supabase
        .from('crypto_transactions')
        .insert(transaction)
        .select('id')
        .single();

      if (error) throw error;

      return { success: true, transaction_id: data.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async convertCryptoToFiat(
    userId: string,
    cryptoAmount: number,
    cryptoType: CryptoType,
    targetCurrency: string = 'USD'
  ): Promise<{ success: boolean; fiat_amount?: number; error?: string }> {
    try {
      const prices = await this.getCryptoPrices();
      const fiatAmount = cryptoAmount * prices[cryptoType];

      // Process conversion (mock)
      await this.updateCryptoBalance(userId, cryptoType, -cryptoAmount);
      
      // Add to fiat wallet (integrate with existing wallet system)
      // await paymentService.updateWalletBalance(userId, targetCurrency, fiatAmount);

      return { success: true, fiat_amount: fiatAmount };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async stakeCrypto(
    userId: string,
    amount: number,
    cryptoType: CryptoType,
    stakingPeriod: number // days
  ): Promise<{ success: boolean; apy: number; error?: string }> {
    try {
      const balance = await this.getCryptoBalance(userId, cryptoType);
      
      if (balance < amount) {
        return { success: false, apy: 0, error: 'Insufficient balance' };
      }

      const apy = this.getStakingAPY(cryptoType, stakingPeriod);
      
      // Create staking record
      const staking = {
        user_id: userId,
        crypto_type: cryptoType,
        amount,
        apy,
        staking_period: stakingPeriod,
        start_date: new Date().toISOString(),
        status: 'active'
      };

      await supabase.from('crypto_staking').insert(staking);
      await this.updateCryptoBalance(userId, cryptoType, -amount);

      return { success: true, apy };
    } catch (error: any) {
      return { success: false, apy: 0, error: error.message };
    }
  }

  private generateWalletAddress(cryptoType: CryptoType): string {
    const prefixes = { BTC: '1', ETH: '0x', USDC: '0x', USDT: '0x' };
    const length = cryptoType === 'BTC' ? 34 : 42;
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    
    let result = prefixes[cryptoType];
    for (let i = result.length; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generatePrivateKey(): string {
    return Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  private generateTransactionHash(): string {
    return Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  private encryptPrivateKey(privateKey: string): string {
    // Use proper encryption in production (AES-256)
    return btoa(privateKey);
  }

  private async updateCryptoBalance(userId: string, cryptoType: CryptoType, amount: number): Promise<void> {
    const { error } = await supabase.rpc('update_crypto_balance', {
      p_user_id: userId,
      p_crypto_type: cryptoType,
      p_amount: amount
    });

    if (error) throw error;
  }

  private getStakingAPY(cryptoType: CryptoType, period: number): number {
    const baseAPY = { BTC: 4.5, ETH: 6.0, USDC: 8.0, USDT: 7.5 };
    const periodMultiplier = Math.min(1.5, 1 + (period / 365));
    return baseAPY[cryptoType] * periodMultiplier;
  }
}

export const cryptocurrencyService = new CryptocurrencyService();