//const User = require('./User'); 
const Note = require('./note'); 
const express = require('express');
const mongoose = require('mongoose'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

app.use(express.json());

// 1. MongoDB Connection 
const mongoURI = 'mongodb+srv://admin:reallyreallyysecretpassword12344@cluster0.5u8mdrl.mongodb.net/?appName=Cluster0';
mongoose.connect(mongoURI) 
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch((error) => console.error('Database connection error:', error));

// 2. User Blueprint (Schema & Model)
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    password: { type: String, required: true },

    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    isBlocked: { 
        type: Boolean, 
        default: false 
    }
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

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied. Unauthorized role." });
        }
        next();
    };
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

        const token = jwt.sign({ id: user._id, role: user.role}, 'MY_SUPER_SECRET_KEY', { expiresIn: '1h' },
                                 
        );
        res.status(200).json({ message: 'Login successful!', token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/notes - Create a new note for the authenticated user
app.post('/api/notes', authenticateToken, async (req, res) => {
    try {
        const { title, content } = req.body;

        // Validation to ensure title and content are provided
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        // Create the new note and link it to the user ID provided by authMiddleware
        const newNote = new Note({
            title,
            content,
            user: req.user.id // This comes directly from your verified JWT payload
        });

        // Save to MongoDB
        await newNote.save();

        res.status(201).json({
            message: "Note created successfully",
            note: newNote
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// GET /api/notes - Retrieve all notes belonging to the authenticated user
app.get('/api/notes', authenticateToken, async (req, res) => {
    try {
        // Find notes where the 'user' field matches the ID from our token
        const userNotes = await Note.find({ user: req.user.id , isArchived: false});
        
        res.status(200).json(userNotes);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// GET /api/notes/:id - Fetch a single note by ID (with Owner validation & Populate)
app.get('/api/notes/:id', authenticateToken, async (req, res) => {
    try {
        // Find the note by its URL ID and "populate" the user details
        const note = await Note.findById(req.params.id).populate('user', 'name email');

        // 1. Check if the note even exists
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        // 2. OWNER VALIDATION: Make sure the note belongs to the logged-in user
        // We compare the note's user ID with the ID from the JWT token
        if (note.user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied: You do not own this note" });
        }

        res.status(200).json(note);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
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
app.get('/api/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
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

// PROMOTE A USER TO ADMIN
app.patch('/api/admin/users/:id/promote', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const userToPromote = await User.findByIdAndUpdate(
            req.params.id, 
            { role: 'admin' }, 
            { new: true }
        ).select('-password');

        if (!userToPromote) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`[AUDIT LOG] Admin ${req.user.id} promoted user ${userToPromote._id} to admin.`);
        res.status(200).json({ message: "User promoted to admin successfully", user: userToPromote });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// BLOCK / BAN A USER
app.patch('/api/admin/users/:id/block', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const userToBlock = await User.findByIdAndUpdate(
            req.params.id, 
            { isBlocked: true }, 
            { new: true }
        ).select('-password');

        if (!userToBlock) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`[AUDIT LOG] Admin ${req.user.id} blocked user ${userToBlock._id}.`);
        res.status(200).json({ message: "User has been blocked", user: userToBlock });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 1. PUT /api/notes/:id - Update a note (Owner only)
app.put('/api/notes/:id', authenticateToken, async (req, res) => {
    try {
        const { title, content } = req.body;
        let note = await Note.findById(req.params.id);

        if (!note) return res.status(404).json({ message: "Note not found" });

        // Owner check
        if (note.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Update fields if provided
        if (title) note.title = title;
        if (content) note.content = content;

        await note.save();
        res.status(200).json({ message: "Note updated successfully", note });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// 2. PATCH /api/notes/:id/archive - Soft-delete/Archive a note (Owner only)
app.patch('/api/notes/:id/archive', authenticateToken, async (req, res) => {
    try {
        let note = await Note.findById(req.params.id);

        if (!note) return res.status(404).json({ message: "Note not found" });
        if (note.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Toggle the archive status
        note.isArchived = !note.isArchived;
        await note.save();

        res.status(200).json({ 
            message: note.isArchived ? "Note archived successfully" : "Note unarchived successfully", 
            note 
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// 3. DELETE /api/notes/:id - Hard delete a note (Owner only)
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) return res.status(404).json({ message: "Note not found" });
        if (note.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" });
        }

        await note.deleteOne();
        res.status(200).json({ message: "Note permanently deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
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