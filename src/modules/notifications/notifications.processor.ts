import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationsService } from './notifications.service';
import { Logger } from '@nestjs/common';
import { NotificationType } from '@/generated/prisma/enums';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'send-notification':
        const { userId, type, message, kudoId } = job.data;
        await this.notificationsService.createNotification({
          userId,
          type: type as NotificationType,
          message,
          kudoId,
        });
        break;

      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }
}
