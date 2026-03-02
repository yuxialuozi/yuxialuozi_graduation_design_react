DO $$
BEGIN
    -- 禁用外键约束检查
    SET CONSTRAINTS ALL DEFERRED;

    -- 清空所有表数据（按依赖顺序）
    TRUNCATE TABLE maintenance CASCADE;
    TRUNCATE TABLE fees CASCADE;
    TRUNCATE TABLE contracts CASCADE;
    TRUNCATE TABLE rooms CASCADE;
    TRUNCATE TABLE tenants CASCADE;

    -- 重置序列
    ALTER SEQUENCE maintenance_id_seq RESTART WITH 1;
    ALTER SEQUENCE fees_id_seq RESTART WITH 1;
    ALTER SEQUENCE contracts_id_seq RESTART WITH 1;
    ALTER SEQUENCE rooms_id_seq RESTART WITH 1;
    ALTER SEQUENCE tenants_id_seq RESTART WITH 1;

    RAISE NOTICE '所有表数据已清空';
END $$;