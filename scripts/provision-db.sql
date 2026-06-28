-- ============================================================================
-- OpenInsights - Database Provisioning & Security Setup
-- ============================================================================

-- ============================================================================
-- 1. Create Databases
-- ============================================================================

CREATE DATABASE IF NOT EXISTS app_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS manufacturing_operations_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;


-- ============================================================================
-- 2. Create Service Accounts
-- ============================================================================

CREATE USER IF NOT EXISTS 'Nexus_app'@'localhost'
IDENTIFIED BY 'Nexus@123';

CREATE USER IF NOT EXISTS 'Nexus_agent'@'localhost'
IDENTIFIED BY 'NexusAgent@123';


-- ============================================================================
-- 3. Grant Permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE
ON app_db.*
TO 'Nexus_app'@'localhost';

GRANT SELECT
ON manufacturing_operations_db.*
TO 'Nexus_agent'@'localhost';

FLUSH PRIVILEGES;


-- ============================================================================
-- 4. Application Database
-- ============================================================================

USE app_db;


-- ============================================================================
-- users
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (

    user_id VARCHAR(20) NOT NULL,

    email VARCHAR(100) NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM('admin','user')
        NOT NULL
        DEFAULT 'user',

    force_password_reset BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    password_changed_at DATETIME NULL,

    last_login_at DATETIME NULL,

    is_active BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    created_by VARCHAR(20) NULL,

    created_at DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id),

    UNIQUE KEY uq_users_email (email),

    INDEX idx_users_role (role),

    INDEX idx_users_active (is_active),

    CONSTRAINT fk_users_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE

)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- password_reset_tokens
-- ============================================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (

    token_id INT NOT NULL AUTO_INCREMENT,

    user_id VARCHAR(20) NOT NULL,

    token_hash VARCHAR(255) NOT NULL,

    expires_at DATETIME NOT NULL,

    used_at DATETIME NULL,

    created_at DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (token_id),

    INDEX idx_prt_user_id (user_id),

    INDEX idx_prt_token_hash (token_hash),

    CONSTRAINT fk_prt_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE

)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- chat_sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS chat_sessions (

    session_id VARCHAR(36) NOT NULL,

    user_id VARCHAR(20) NOT NULL,

    title VARCHAR(60) NOT NULL,

    is_deleted BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    created_at DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (session_id),

    INDEX idx_cs_user_id (user_id),

    INDEX idx_cs_user_updated (user_id, updated_at),

    CONSTRAINT fk_cs_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE

)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- messages
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (

    message_id VARCHAR(36) NOT NULL,

    session_id VARCHAR(36) NOT NULL,

    role ENUM('user','assistant')
        NOT NULL,

    content TEXT NOT NULL,

    blocks JSON NULL,

    generated_sql TEXT NULL,

    sql_executed TEXT NULL,

    sql_validation_status
        ENUM(
            'approved',
            'optimized',
            'rejected'
        ) NULL,

    result_validation_status
        ENUM(
            'validated',
            'warning',
            'failed'
        ) NULL,

    optimization_notes TEXT NULL,

    tables_accessed JSON NULL,

    execution_time_ms INT NULL,

    created_at DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (message_id),

    INDEX idx_msg_session_id (session_id),

    INDEX idx_msg_session_created (session_id, created_at),

    CONSTRAINT fk_msg_session_id
        FOREIGN KEY (session_id)
        REFERENCES chat_sessions(session_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE

)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- audit_logs
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (

    audit_id INT NOT NULL AUTO_INCREMENT,

    user_id VARCHAR(20) NOT NULL,

    action VARCHAR(40) NOT NULL,

    entity_type VARCHAR(20) NULL,

    entity_id VARCHAR(36) NULL,

    description TEXT NULL,

    created_at DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (audit_id),

    INDEX idx_al_user_id (user_id),

    INDEX idx_al_action (action),

    INDEX idx_al_created_at (created_at),

    CONSTRAINT fk_al_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE

)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- ============================================================================
-- Seed Initial Admin
-- ============================================================================

INSERT IGNORE INTO users (

    user_id,
    email,
    password_hash,
    role,
    force_password_reset,
    is_active,
    created_by

)
VALUES (

    'ADMIN001',
    'admin@nexus.com',
    '$2b$12$REPLACE_WITH_REAL_BCRYPT_HASH',
    'admin',
    FALSE,
    TRUE,
    NULL

);


-- ============================================================================
-- Verification
-- ============================================================================

SHOW TABLES;

SELECT
    TABLE_NAME,
    ENGINE,
    TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA='app_db';

SELECT
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA='app_db'
AND REFERENCED_TABLE_NAME IS NOT NULL;