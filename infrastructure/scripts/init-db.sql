-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a read-only audit role
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'audit_reader') THEN
      CREATE ROLE audit_reader WITH NOLOGIN;
   END IF;
END
$do$;

-- Assume an audit_logs table will be created by migrations
-- Grant SELECT only to audit_reader
-- REVOKE UPDATE, DELETE ON audit_logs FROM public;
-- GRANT SELECT ON audit_logs TO audit_reader;

-- RLS Helper Function: set_tenant_context
-- Useful for multi-tenancy row level security
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_tenant', tenant_uuid::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Retrieve current tenant context function
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_tenant', true)::UUID;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;
