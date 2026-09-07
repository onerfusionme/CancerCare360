export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  keycloak: {
    authServerUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080/auth',
    realm: process.env.KEYCLOAK_REALM || 'cancercare360',
    clientId: process.env.KEYCLOAK_CLIENT_ID || 'backend-api',
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  },
  minio: {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
  },
});
