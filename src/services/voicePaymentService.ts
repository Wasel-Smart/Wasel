interface VoiceCommand {
  command: string;
  confidence: number;
  parameters: Record<string, any>;
}

interface VoicePaymentResult {
  success: boolean;
  action: string;
  amount?: number;
  message: string;
  requiresConfirmation?: boolean;
}

class VoicePaymentService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      this.recognition.onresult = this.handleSpeechResult.bind(this);
      this.recognition.onerror = this.handleSpeechError.bind(this);
      this.recognition.onend = () => { this.isListening = false; };
    }
  }

  async startListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    if (this.isListening) return;

    this.isListening = true;
    this.speak('Listening for payment command...');
    this.recognition.start();
  }

  private handleSpeechResult(event: SpeechRecognitionEvent): void {
    const transcript = event.results[0][0].transcript.toLowerCase();
    const confidence = event.results[0][0].confidence;
    
    console.log('Voice command:', transcript, 'Confidence:', confidence);
    
    if (confidence < 0.7) {
      this.speak('Sorry, I didn\'t understand that clearly. Please try again.');
      return;
    }

    const command = this.parseVoiceCommand(transcript);
    this.executeVoiceCommand(command);
  }

  private handleSpeechError(event: SpeechRecognitionErrorEvent): void {
    console.error('Speech recognition error:', event.error);
    this.speak('Sorry, there was an error processing your voice command.');
    this.isListening = false;
  }

  private parseVoiceCommand(transcript: string): VoiceCommand {
    const commands = [
      {
        pattern: /pay for (this )?ride/i,
        action: 'pay_ride',
        extract: () => ({})
      },
      {
        pattern: /add (\d+) (dollars?|aed|sar) to wallet/i,
        action: 'add_funds',
        extract: (match: RegExpMatchArray) => ({
          amount: parseInt(match[1]),
          currency: match[2].toUpperCase().replace('DOLLARS', 'USD').replace('DOLLAR', 'USD')
        })
      },
      {
        pattern: /check (my )?balance/i,
        action: 'check_balance',
        extract: () => ({})
      },
      {
        pattern: /send (\d+) (dollars?|aed|sar) to (.+)/i,
        action: 'send_money',
        extract: (match: RegExpMatchArray) => ({
          amount: parseInt(match[1]),
          currency: match[2].toUpperCase().replace('DOLLARS', 'USD').replace('DOLLAR', 'USD'),
          recipient: match[3]
        })
      },
      {
        pattern: /book a ride to (.+)/i,
        action: 'book_ride',
        extract: (match: RegExpMatchArray) => ({
          destination: match[1]
        })
      },
      {
        pattern: /tip driver (\d+) (dollars?|aed|sar)/i,
        action: 'tip_driver',
        extract: (match: RegExpMatchArray) => ({
          amount: parseInt(match[1]),
          currency: match[2].toUpperCase().replace('DOLLARS', 'USD').replace('DOLLAR', 'USD')
        })
      }
    ];

    for (const cmd of commands) {
      const match = transcript.match(cmd.pattern);
      if (match) {
        return {
          command: cmd.action,
          confidence: 0.9,
          parameters: cmd.extract(match)
        };
      }
    }

    return {
      command: 'unknown',
      confidence: 0,
      parameters: { transcript }
    };
  }

  private async executeVoiceCommand(command: VoiceCommand): Promise<void> {
    try {
      let result: VoicePaymentResult;

      switch (command.command) {
        case 'pay_ride':
          result = await this.handlePayRide();
          break;
        case 'add_funds':
          result = await this.handleAddFunds(command.parameters.amount, command.parameters.currency);
          break;
        case 'check_balance':
          result = await this.handleCheckBalance();
          break;
        case 'send_money':
          result = await this.handleSendMoney(command.parameters.amount, command.parameters.currency, command.parameters.recipient);
          break;
        case 'book_ride':
          result = await this.handleBookRide(command.parameters.destination);
          break;
        case 'tip_driver':
          result = await this.handleTipDriver(command.parameters.amount, command.parameters.currency);
          break;
        default:
          result = {
            success: false,
            action: 'unknown',
            message: 'I didn\'t understand that command. Try saying "pay for ride" or "check balance".'
          };
      }

      this.speak(result.message);

      if (result.requiresConfirmation) {
        this.requestVoiceConfirmation(result);
      }
    } catch (error) {
      this.speak('Sorry, there was an error processing your request.');
    }
  }

  private async handlePayRide(): Promise<VoicePaymentResult> {
    // Get current active trip
    const activeTrip = await this.getCurrentTrip();
    
    if (!activeTrip) {
      return {
        success: false,
        action: 'pay_ride',
        message: 'No active ride found to pay for.'
      };
    }

    return {
      success: true,
      action: 'pay_ride',
      amount: activeTrip.fare,
      message: `Ready to pay ${activeTrip.fare} AED for your ride. Say "confirm" to proceed.`,
      requiresConfirmation: true
    };
  }

  private async handleAddFunds(amount: number, currency: string): Promise<VoicePaymentResult> {
    return {
      success: true,
      action: 'add_funds',
      amount,
      message: `Ready to add ${amount} ${currency} to your wallet. Say "confirm" to proceed.`,
      requiresConfirmation: true
    };
  }

  private async handleCheckBalance(): Promise<VoicePaymentResult> {
    // Mock balance check
    const balance = { AED: 250.75, USD: 68.25 };
    
    return {
      success: true,
      action: 'check_balance',
      message: `Your wallet balance is ${balance.AED} AED and ${balance.USD} US dollars.`
    };
  }

  private async handleSendMoney(amount: number, currency: string, recipient: string): Promise<VoicePaymentResult> {
    return {
      success: true,
      action: 'send_money',
      amount,
      message: `Ready to send ${amount} ${currency} to ${recipient}. Say "confirm" to proceed.`,
      requiresConfirmation: true
    };
  }

  private async handleBookRide(destination: string): Promise<VoicePaymentResult> {
    return {
      success: true,
      action: 'book_ride',
      message: `Searching for rides to ${destination}. This will be charged to your default payment method.`
    };
  }

  private async handleTipDriver(amount: number, currency: string): Promise<VoicePaymentResult> {
    return {
      success: true,
      action: 'tip_driver',
      amount,
      message: `Ready to tip your driver ${amount} ${currency}. Say "confirm" to proceed.`,
      requiresConfirmation: true
    };
  }

  private async requestVoiceConfirmation(result: VoicePaymentResult): Promise<void> {
    // Wait for confirmation
    setTimeout(() => {
      this.startListening();
    }, 2000);
  }

  private speak(text: string): void {
    if (this.synthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      this.synthesis.speak(utterance);
    }
  }

  private async getCurrentTrip(): Promise<any> {
    // Mock current trip
    return {
      id: 'trip-123',
      fare: 45.50,
      status: 'completed'
    };
  }

  // Voice authentication for security
  async authenticateVoice(userId: string): Promise<boolean> {
    // Mock voice authentication (use voice biometrics in production)
    this.speak('Please say "Wassel authenticate" to confirm your identity.');
    
    return new Promise((resolve) => {
      const tempRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      tempRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        const isAuthenticated = transcript.includes('wassel authenticate');
        
        if (isAuthenticated) {
          this.speak('Voice authentication successful.');
        } else {
          this.speak('Voice authentication failed.');
        }
        
        resolve(isAuthenticated);
      };
      
      tempRecognition.start();
    });
  }

  // Emergency voice commands
  async handleEmergencyCommand(): Promise<void> {
    this.speak('Emergency mode activated. Contacting emergency services and sharing your location.');
    
    // Trigger emergency alert
    // await emergencyService.triggerAlert();
  }
}

// Global voice command activation
class VoiceActivationService {
  private voicePayment: VoicePaymentService;
  private isActive = false;

  constructor() {
    this.voicePayment = new VoicePaymentService();
    this.setupGlobalListening();
  }

  private setupGlobalListening(): void {
    // Listen for "Hey Wassel" wake word
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        
        if (transcript.includes('hey wassel') || transcript.includes('ok wassel')) {
          this.activateVoiceCommands();
        }
        
        if (transcript.includes('emergency') || transcript.includes('help')) {
          this.voicePayment.handleEmergencyCommand();
        }
      };
      
      recognition.start();
    }
  }

  private async activateVoiceCommands(): Promise<void> {
    if (this.isActive) return;
    
    this.isActive = true;
    await this.voicePayment.startListening();
    
    setTimeout(() => {
      this.isActive = false;
    }, 10000); // 10 second timeout
  }
}

export const voicePaymentService = new VoicePaymentService();
export const voiceActivationService = new VoiceActivationService();