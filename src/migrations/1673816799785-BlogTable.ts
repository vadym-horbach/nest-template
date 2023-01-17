import { MigrationInterface, QueryRunner } from 'typeorm'

export class BlogTable1673816799785 implements MigrationInterface {
  name = 'BlogTable1673816799785'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "blog-posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, "imageUrl" character varying, "title" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_782e623521fcf242d4ee5216498" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "blog-posts" ADD CONSTRAINT "FK_3eff84dfe9213b3eccb08cf6d27" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog-posts" DROP CONSTRAINT "FK_3eff84dfe9213b3eccb08cf6d27"`,
    )
    await queryRunner.query(`DROP TABLE "blog-posts"`)
  }
}
