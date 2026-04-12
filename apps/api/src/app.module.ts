import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { StorageModule } from './storage/storage.module';
import { DocumentsModule } from './documents/documents.module';
import { EntitiesModule } from './entities/entities.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { AuthModule } from './auth/auth.module';
import { ReportingModule } from './reporting/reporting.module';
import { SeedModule } from './seed/seed.module';
import { HealthModule } from './health/health.module';
import { AuditModule } from './audit/audit.module';
import { CalendarModule } from './calendar/calendar.module';
import { VaultModule } from './vault/vault.module';
import { ExposureModule } from './exposure/exposure.module';
import { ForecastModule } from './forecast/forecast.module';
import { ReconciliationModule } from './reconciliation/reconciliation.module';
import { AnalystModule } from './analyst/analyst.module';
import { TaxModule } from './tax/tax.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    StorageModule,
    AuthModule,
    HealthModule,
    AuditModule,
    DocumentsModule,
    EntitiesModule,
    PortfolioModule,
    ReportingModule,
    CalendarModule,
    VaultModule,
    ExposureModule,
    ForecastModule,
    ReconciliationModule,
    AnalystModule,
    TaxModule,
    SeedModule,
  ],
})
export class AppModule {}
