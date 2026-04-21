CREATE TABLE IF NOT EXISTS employees (
  id          SERIAL        PRIMARY KEY,
  name        VARCHAR(255)  NOT NULL,
  role        VARCHAR(255)  NOT NULL,
  skills      TEXT[]        NOT NULL DEFAULT '{}',
  experience  VARCHAR(100),
  team        VARCHAR(255),
  status      VARCHAR(50)   NOT NULL DEFAULT 'available',
  email       VARCHAR(255)  UNIQUE NOT NULL,
  phone       VARCHAR(50),
  location    VARCHAR(255),
  department  VARCHAR(255),
  joined_date VARCHAR(50),
  bio         TEXT
);
