require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const { errorHandler } = require('./middleware/errorMiddleware');
const swaggerSpec = require('./docs/swagger');

const app = express();



// 2. Global Security & Utility Middlewares
app.use(helmet({ contentSecurityPolicy: false })); // Keeps Swagger styles working locally
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 3. Serve the Visual Documentation to the Browser
// Mount UI dashboard to the browser endpoint
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 4. Core System Routes
app.get('/api/v1/health', (req, res) => res.status(200).json({ status: 'healthy' }));



// Feature Modules Mounting
app.use('/api/v1/auth', require('./routes/authRoutes'));
// 5. Central Safety Net (Error Handler)
app.use(errorHandler);
module.exports = app;