-- Safra Rental Platform Seed Data
-- Run this after 001-create-schema.sql

-- Insert Wilayas (main Algerian provinces)
INSERT INTO wilayas (code, name_fr, name_en, name_ar, lat, lng) VALUES
('16', 'Alger', 'Algiers', 'الجزائر', 36.7538, 3.0588),
('31', 'Oran', 'Oran', 'وهران', 35.6969, -0.6331),
('06', 'Béjaïa', 'Bejaia', 'بجاية', 36.7509, 5.0564),
('13', 'Tlemcen', 'Tlemcen', 'تلمسان', 34.8828, -1.3165),
('10', 'Bouira', 'Bouira', 'البويرة', 36.3733, 3.9008),
('11', 'Tamanrasset', 'Tamanrasset', 'تمنراست', 22.7850, 5.5228),
('42', 'Tipaza', 'Tipaza', 'تيبازة', 36.5951, 2.4476),
('25', 'Constantine', 'Constantine', 'قسنطينة', 36.3650, 6.6147),
('19', 'Sétif', 'Setif', 'سطيف', 36.1898, 5.4108),
('23', 'Annaba', 'Annaba', 'عنابة', 36.9000, 7.7667),
('09', 'Blida', 'Blida', 'البليدة', 36.4722, 2.8277),
('15', 'Tizi Ouzou', 'Tizi Ouzou', 'تيزي وزو', 36.7169, 4.0497)
ON DUPLICATE KEY UPDATE name_fr = VALUES(name_fr);

-- Insert Amenities
INSERT INTO amenities (code, name_fr, name_en, name_ar, icon) VALUES
('wifi', 'Wi-Fi', 'Wi-Fi', 'واي فاي', 'Wifi'),
('ac', 'Climatisation', 'Air Conditioning', 'تكييف', 'Wind'),
('parking', 'Parking', 'Parking', 'موقف سيارات', 'ParkingMeter'),
('tv', 'Télévision', 'Television', 'تلفزيون', 'Tv'),
('kitchen', 'Cuisine', 'Kitchen', 'مطبخ', 'ChefHat'),
('pool', 'Piscine', 'Swimming Pool', 'مسبح', 'Waves'),
('balcony', 'Balcon', 'Balcony', 'شرفة', 'Home'),
('washer', 'Machine à laver', 'Washing Machine', 'غسالة', 'WashingMachine'),
('heating', 'Chauffage', 'Heating', 'تدفئة', 'Flame'),
('garden', 'Jardin', 'Garden', 'حديقة', 'TreeDeciduous'),
('security', 'Sécurité 24h', '24h Security', 'أمن 24 ساعة', 'Shield'),
('sea_view', 'Vue sur mer', 'Sea View', 'إطلالة على البحر', 'Waves')
ON DUPLICATE KEY UPDATE name_fr = VALUES(name_fr);

-- Insert Admin User
-- Email: admin@safra.dz
-- Password: Safra@2026#
-- Hash generated with bcrypt (cost factor 10)
INSERT INTO users (email, password_hash, full_name, phone, role, is_verified, verification_status) VALUES
('admin@safra.dz', '$2b$10$whlXupObxHZYfj2dQnSmvuYK9JPxUmY2hyJGr7wZcHkNaUrDJnls6', 'Admin Safra', '+213555000000', 'admin', TRUE, 'approved')
ON DUPLICATE KEY UPDATE 
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  is_verified = VALUES(is_verified),
  verification_status = VALUES(verification_status);
