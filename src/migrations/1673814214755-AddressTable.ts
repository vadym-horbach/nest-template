import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddressTable1673814214755 implements MigrationInterface {
  name = 'AddressTable1673814214755'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users_addresses" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, "isDefault" boolean NOT NULL DEFAULT false, "country" character varying NOT NULL, "countryCode" character varying NOT NULL, "city" character varying, "state" character varying, "postCode" character varying NOT NULL, "street" character varying NOT NULL, "address" character varying NOT NULL, "apartments" character varying, CONSTRAINT "PK_2f8d527df0d3acb8aa51945a968" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "users_addresses" ADD CONSTRAINT "FK_f37ee0c84e56c1124a44a0af14e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_addresses" DROP CONSTRAINT "FK_f37ee0c84e56c1124a44a0af14e"`,
    )
    await queryRunner.query(`DROP TABLE "users_addresses"`)
  }
}
