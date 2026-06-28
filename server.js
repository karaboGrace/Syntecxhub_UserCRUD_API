const express = require('express');
const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

app.use(express.json());

// 1. MongoDB Connection 
const mongoURI = "YOUR_MONGODB_URI_PLACEHOLDER";
mongoose.connect(MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch((error) => console.error('Database connection error:', error));

// 2. User Blueprint (Schema & Model)
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    password: { type: String, required: true }
});

// Automatically hash password before saving to database
// REMOVED NEXT COMPLETELY: Uses pure async/await resolution to prevent the error entirely
userSchema.pre('save', async function () {
    // 1. If password hasn't changed, just stop execution (acts like return next())
    if (!this.isModified('password')) return;

    try {
        // 2. Hash the password and assign it
        this.password = await bcrypt.hash(this.password, 10);
    } catch (err) {
        // 3. Throw a standard error if bcrypt fails
        throw new Error(err);
    }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// 3. SECURITY GUARD (Middleware)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

    jwt.verify(token, 'MY_SUPER_SECRET_KEY', (err, decodedUser) => {
        if (err) return res.status(403).json({ message: 'Invalid or Expired Token' });
        req.user = decodedUser; 
        next(); 
    });
};

// --- API ENDPOINTS (AUTHENTICATION) ---

// SIGNUP: Register a new user
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, age, password } = req.body;
        const newUser = new User({ name, email, age, password });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// LOGIN: Verify user and return JWT Token
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ id: user._id }, 'MY_SUPER_SECRET_KEY', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful!', token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- API ENDPOINTS (CRUD) ---

// CREATE: Add a new user (Open)
app.post('/api/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// READ ALL: Fetch all users (PROTECTED BY JWT!)
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// READ ONE: Get a single user by ID (Open)
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE: Change user details (Open)
app.patch('/api/users/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE: Remove a user (Open)
app.delete('/api/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});