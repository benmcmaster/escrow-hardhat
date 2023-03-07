CREATE DATABASE escrow_app;
USE escrow_app;

CREATE TABLE contracts (
  id integer PRIMARY KEY AUTO_INCREMENT,
  `address` VARCHAR(255) NOT NULL,
  depositor VARCHAR(255) NOT NULL,
  arbiter VARCHAR(255) NOT NULL,
  beneficiary VARCHAR(255) NOT NULL,
  `value` BIGINT NOT NULL,
  decision VARCHAR(255) NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO contracts (`address`, depositor, arbiter, beneficiary, `value`, decision)
VALUES 
('0x123', '0x456', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0x101112', 100000000000000000, 'approved'),
('0x123', '0x456', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0x101112', 100000000000000000, 'rejected');
