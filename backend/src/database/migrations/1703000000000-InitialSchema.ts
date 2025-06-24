import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1703000000000 implements MigrationInterface {
    name = 'InitialSchema1703000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "username" character varying(50) NOT NULL,
                "email" character varying(100) NOT NULL,
                "password_hash" character varying(255) NOT NULL,
                "full_name" character varying(100),
                "avatar_url" character varying(255),
                "bio" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_username" UNIQUE ("username"),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
            )
        `);

        // Create categories table
        await queryRunner.query(`
            CREATE TABLE "categories" (
                "id" SERIAL NOT NULL,
                "name" character varying(100) NOT NULL,
                "slug" character varying(100) NOT NULL,
                "description" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
                CONSTRAINT "UQ_categories_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_categories_id" PRIMARY KEY ("id")
            )
        `);

        // Create tags table
        await queryRunner.query(`
            CREATE TABLE "tags" (
                "id" SERIAL NOT NULL,
                "name" character varying(50) NOT NULL,
                "slug" character varying(50) NOT NULL,
                CONSTRAINT "UQ_tags_name" UNIQUE ("name"),
                CONSTRAINT "UQ_tags_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_tags_id" PRIMARY KEY ("id")
            )
        `);

        // Create posts table
        await queryRunner.query(`
            CREATE TYPE "posts_status_enum" AS ENUM('draft', 'published', 'archived');
            CREATE TABLE "posts" (
                "id" SERIAL NOT NULL,
                "title" character varying(255) NOT NULL,
                "slug" character varying(255) NOT NULL,
                "content" text NOT NULL,
                "excerpt" text,
                "featured_image" character varying(255),
                "status" "posts_status_enum" NOT NULL DEFAULT 'draft',
                "views_count" integer NOT NULL DEFAULT '0',
                "author_id" integer NOT NULL,
                "category_id" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "published_at" TIMESTAMP,
                CONSTRAINT "UQ_posts_slug" UNIQUE ("slug"),
                CONSTRAINT "PK_posts_id" PRIMARY KEY ("id")
            )
        `);

        // Create post_tags junction table
        await queryRunner.query(`
            CREATE TABLE "post_tags" (
                "post_id" integer NOT NULL,
                "tag_id" integer NOT NULL,
                CONSTRAINT "PK_post_tags" PRIMARY KEY ("post_id", "tag_id")
            )
        `);

        // Create comments table
        await queryRunner.query(`
            CREATE TYPE "comments_status_enum" AS ENUM('pending', 'approved', 'spam');
            CREATE TABLE "comments" (
                "id" SERIAL NOT NULL,
                "content" text NOT NULL,
                "author_name" character varying(100) NOT NULL,
                "author_email" character varying(100) NOT NULL,
                "author_website" character varying(255),
                "post_id" integer NOT NULL,
                "parent_id" integer,
                "status" "comments_status_enum" NOT NULL DEFAULT 'pending',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_comments_id" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "posts" 
            ADD CONSTRAINT "FK_posts_author" 
            FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "posts" 
            ADD CONSTRAINT "FK_posts_category" 
            FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "post_tags" 
            ADD CONSTRAINT "FK_post_tags_post" 
            FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "post_tags" 
            ADD CONSTRAINT "FK_post_tags_tag" 
            FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "comments" 
            ADD CONSTRAINT "FK_comments_post" 
            FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "comments" 
            ADD CONSTRAINT "FK_comments_parent" 
            FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE
        `);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_posts_author" ON "posts" ("author_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_posts_category" ON "posts" ("category_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_posts_status" ON "posts" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_posts_published_at" ON "posts" ("published_at")`);
        await queryRunner.query(`CREATE INDEX "IDX_comments_post" ON "comments" ("post_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_comments_parent" ON "comments" ("parent_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_comments_status" ON "comments" ("status")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_comments_status"`);
        await queryRunner.query(`DROP INDEX "IDX_comments_parent"`);
        await queryRunner.query(`DROP INDEX "IDX_comments_post"`);
        await queryRunner.query(`DROP INDEX "IDX_posts_published_at"`);
        await queryRunner.query(`DROP INDEX "IDX_posts_status"`);
        await queryRunner.query(`DROP INDEX "IDX_posts_category"`);
        await queryRunner.query(`DROP INDEX "IDX_posts_author"`);

        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_parent"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_comments_post"`);
        await queryRunner.query(`ALTER TABLE "post_tags" DROP CONSTRAINT "FK_post_tags_tag"`);
        await queryRunner.query(`ALTER TABLE "post_tags" DROP CONSTRAINT "FK_post_tags_post"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_posts_category"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_posts_author"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TYPE "comments_status_enum"`);
        await queryRunner.query(`DROP TABLE "post_tags"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TYPE "posts_status_enum"`);
        await queryRunner.query(`DROP TABLE "tags"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
} 