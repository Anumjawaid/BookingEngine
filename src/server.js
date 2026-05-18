const app = require('./app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Engine roaring on port ${PORT}`);
  console.log(`📋 Documentation live at http://localhost:${PORT}/docs`);
});