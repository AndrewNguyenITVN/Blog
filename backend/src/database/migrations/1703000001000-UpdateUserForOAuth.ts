import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateUserForOAuth1703000001000 implements MigrationInterface {
    name = 'UpdateUserForOAuth1703000001000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thay đổi password_hash thành nullable
        await queryRunner.changeColumn('users', 'password_hash', new TableColumn({
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: true,
        }));

        // Thêm google_id column
        await queryRunner.addColumn('users', new TableColumn({
            name: 'google_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
            isUnique: true,
        }));

        // Thêm provider column
        await queryRunner.addColumn('users', new TableColumn({
            name: 'provider',
            type: 'varchar',
            length: '20',
            default: "'local'",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa provider column
        await queryRunner.dropColumn('users', 'provider');

        // Xóa google_id column
        await queryRunner.dropColumn('users', 'google_id');

        // Đổi password_hash về NOT NULL
        await queryRunner.changeColumn('users', 'password_hash', new TableColumn({
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
        }));
    }
} 