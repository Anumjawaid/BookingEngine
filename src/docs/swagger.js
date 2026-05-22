const path = require('path');
const YAML = require('yamljs');

// 1. Load base configuration metadata
const baseConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Travel Booking Engine API',
    version: '1.0.0',
    description: 'Enterprise MERN Travel Platform Live Documentation Engine.',
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
  ],
  paths: {},
  components: {
    schemas: {},
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

// 2. Dynamically attach decoupled files
try {
  // Load Paths
  const authPaths = YAML.load(path.join(__dirname, 'paths/auth.yaml'));
  baseConfig.paths = { ...baseConfig.paths, ...authPaths };

  // Load Schemas
  const userSchema = YAML.load(path.join(__dirname, 'schemas/user.yaml'));
  const errorSchema = YAML.load(path.join(__dirname, 'schemas/error.yaml'));
  
  baseConfig.components.schemas = {
    ...baseConfig.components.schemas,
    ...userSchema,
    ...errorSchema,
  };
} catch (error) {
  console.error('❌ Error compiling Swagger documentation sub-modules:', error.message);
}

module.exports = baseConfig;