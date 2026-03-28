// biome-ignore lint/style/useImportType: <explanation>
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common"
import { PrismaClient } from "../../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      max: 10, // connection pool size
    })

    super({
      adapter,
      log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "error" },
        { emit: "event", level: "warn" },
      ],
    })
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log("Prisma connected to database")
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log("Prisma disconnected from database")
  }

  /**
   * Execute operations in a transaction
   */
  async executeInTransaction<T>(
    fn: (prisma: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(fn)
  }
}
