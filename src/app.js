require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// 1. Parse Swagger Documentation File
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));

// 2. Global Security & Utility Middlewares
app.use(helmet({ contentSecurityPolicy: false })); // Keeps Swagger styles working locally
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3. Serve the Visual Documentation to the Browser
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 4. Core System Routes
app.get('/api/v1/health', (req, res) => res.status(200).json({ status: 'healthy' }));

// 5. Central Safety Net (Error Handler)
app.use(errorHandler);

module.exports = app;