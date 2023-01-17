import { MigrationInterface, QueryRunner } from 'typeorm'

export class UsersTable1673814002581 implements MigrationInterface {
  name = 'UsersTable1673814002581'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_accounttype_enum" AS ENUM('personal', 'business')`,
    )
    await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`)
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "logToken" character varying NOT NULL, "accountType" "public"."users_accounttype_enum" NOT NULL DEFAULT 'personal', "language" character varying NOT NULL DEFAULT 'en', "lastActivities" TIMESTAMP, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "isVerifiedEmail" boolean NOT NULL DEFAULT false, "isVerifiedKYC" boolean NOT NULL DEFAULT false, "isBanned" boolean NOT NULL DEFAULT false, "phone" character varying, "businessName" character varying, "businessPhone" character varying, "businessAddress" character varying, "fireblocksAccountId" character varying, "imageUrl" character varying, "settingsEscrowCreatedNotice" boolean NOT NULL DEFAULT true, "settingsEscrowUpdatedNotice" boolean NOT NULL DEFAULT true, "settingsChangeSettingsNotice" boolean NOT NULL DEFAULT true, "settingsChatMessageNotice" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`)
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`)
    await queryRunner.query(`DROP TYPE "public"."users_accounttype_enum"`)
  }
}
