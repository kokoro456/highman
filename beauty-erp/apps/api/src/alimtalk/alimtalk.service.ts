import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface AlimtalkMessage {
  to: string;
  templateCode: string;
  variables: Record<string, string>;
}

@Injectable()
export class AlimtalkService {
  private readonly logger = new Logger(AlimtalkService.name);
  private senderKey: string;
  private apiKey: string;
  private isConfigured: boolean;

  constructor(private config: ConfigService) {
    this.senderKey = this.config.get('KAKAO_ALIMTALK_SENDER_KEY', '');
    this.apiKey = this.config.get('KAKAO_REST_API_KEY', '');
    this.isConfigured = !!(this.senderKey && this.apiKey);

    if (!this.isConfigured) {
      this.logger.warn('Kakao Alimtalk is not configured. Messages will be logged only.');
    }
  }

  async sendBookingConfirmation(phone: string, data: {
    customerName: string;
    shopName: string;
    serviceName: string;
    dateTime: string;
    staffName: string;
  }) {
    const templateCode = this.config.get(
      'KAKAO_ALIMTALK_TEMPLATE_BOOKING_CONFIRM',
      'BOOKING_CONFIRM',
    );
    return this.send({
      to: phone,
      templateCode,
      variables: {
        '#{고객명}': data.customerName,
        '#{매장명}': data.shopName,
        '#{서비스}': data.serviceName,
        '#{일시}': data.dateTime,
        '#{담당자}': data.staffName,
      },
    });
  }

  async sendBookingReminder(phone: string, data: {
    customerName: string;
    shopName: string;
    serviceName: string;
    dateTime: string;
  }) {
    const templateCode = this.config.get(
      'KAKAO_ALIMTALK_TEMPLATE_BOOKING_REMIND',
      'BOOKING_REMIND',
    );
    return this.send({
      to: phone,
      templateCode,
      variables: {
        '#{고객명}': data.customerName,
        '#{매장명}': data.shopName,
        '#{서비스}': data.serviceName,
        '#{일시}': data.dateTime,
      },
    });
  }

  async sendBookingCancellation(phone: string, data: {
    customerName: string;
    shopName: string;
    serviceName: string;
    dateTime: string;
  }) {
    const templateCode = this.config.get(
      'KAKAO_ALIMTALK_TEMPLATE_BOOKING_CANCEL',
      'BOOKING_CANCEL',
    );
    return this.send({
      to: phone,
      templateCode,
      variables: {
        '#{고객명}': data.customerName,
        '#{매장명}': data.shopName,
        '#{서비스}': data.serviceName,
        '#{일시}': data.dateTime,
      },
    });
  }

  private async send(message: AlimtalkMessage) {
    if (!this.isConfigured) {
      this.logger.log(
        `[DRY RUN] Alimtalk to ${message.to}: template=${message.templateCode}, vars=${JSON.stringify(message.variables)}`,
      );
      return { success: true, dryRun: true };
    }

    try {
      const response = await fetch(
        'https://kapi.kakao.com/v2/api/talk/memo/default/send',
        {
          method: 'POST',
          headers: {
            Authorization: `KakaoAK ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderKey: this.senderKey,
            templateCode: message.templateCode,
            recipientList: [
              {
                recipientNo: message.to.replace(/-/g, ''),
                templateParameter: message.variables,
              },
            ],
          }),
        },
      );

      const result = await response.json();
      this.logger.log(`Alimtalk sent to ${message.to}: ${JSON.stringify(result)}`);
      return { success: response.ok, result };
    } catch (error: any) {
      this.logger.error(`Alimtalk failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  getStatus() {
    return { configured: this.isConfigured };
  }
}
