-- Kanban Database Schema for Supabase
-- This file contains the complete database schema for the Trello-like Kanban application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create boards table
CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create columns table
CREATE TABLE IF NOT EXISTS columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(7), -- For hex colors like #FF5733
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_columns_board_id ON columns(board_id);
CREATE INDEX IF NOT EXISTS idx_columns_position ON columns(board_id, position);
CREATE INDEX IF NOT EXISTS idx_cards_column_id ON cards(column_id);
CREATE INDEX IF NOT EXISTS idx_cards_position ON cards(column_id, position);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_columns_updated_at BEFORE UPDATE ON columns 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for boards table
-- For this demo, we'll allow all operations on all boards
-- In a real application, you would implement user-based access control
CREATE POLICY "Enable all operations for all users on boards" ON boards
    FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for columns table
CREATE POLICY "Enable all operations for all users on columns" ON columns
    FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for cards table
CREATE POLICY "Enable all operations for all users on cards" ON cards
    FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data for development
INSERT INTO boards (id, title, description) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'My First Kanban Board', 'A sample board to get started with the Kanban application')
ON CONFLICT (id) DO NOTHING;

INSERT INTO columns (id, title, board_id, position) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'To Do', '550e8400-e29b-41d4-a716-446655440000', 0),
    ('550e8400-e29b-41d4-a716-446655440002', 'In Progress', '550e8400-e29b-41d4-a716-446655440000', 1),
    ('550e8400-e29b-41d4-a716-446655440003', 'Done', '550e8400-e29b-41d4-a716-446655440000', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO cards (id, title, description, column_id, position, color) VALUES 
    ('550e8400-e29b-41d4-a716-446655440004', 'Setup Development Environment', 'Configure Angular and NestJS development environment', '550e8400-e29b-41d4-a716-446655440001', 0, '#FF6B6B'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Create Database Schema', 'Design and implement the Supabase database schema', '550e8400-e29b-41d4-a716-446655440001', 1, '#4ECDC4'),
    ('550e8400-e29b-41d4-a716-446655440006', 'Build Backend API', 'Implement NestJS GraphQL API with all CRUD operations', '550e8400-e29b-41d4-a716-446655440002', 0, '#45B7D1'),
    ('550e8400-e29b-41d4-a716-446655440007', 'Design UI Components', 'Create Angular components for Kanban board interface', '550e8400-e29b-41d4-a716-446655440002', 1, '#96CEB4'),
    ('550e8400-e29b-41d4-a716-446655440008', 'Project Planning', 'Define requirements and create project roadmap', '550e8400-e29b-41d4-a716-446655440003', 0, '#FFEAA7')
ON CONFLICT (id) DO NOTHING; 