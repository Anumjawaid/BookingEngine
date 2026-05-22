const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(value) {
        // Clean, standard RFC 5322 compliant email check
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'Please provide a valid email address'
    }
  },
  phone: {
    type: String,
    required: [true, 'Please provide a contact phone number'],
    trim: true // 💡 Optimization: Added trim to clean up accidental trailing whitespaces
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, 
    validate: {
      validator: function(value) {
        // 🔒 FIX: Added {8,}+$ anchors to guarantee the ENTIRE password meets validation constraints safely
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongPasswordRegex.test(value);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'superadmin'],
      message: 'Role must be either user or superadmin' // 💡 Optimization: Avoid generic validation errors for roles
    },
    default: 'user',
  }
}, { 
  timestamps: true,
  versionKey: false // 💡 Optimization: Cleans up database records by stripping out internal __v document version numbers
});

// Document Middleware: Automatically hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance Method: Helper to check if a password matches
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('User', userSchema);