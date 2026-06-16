const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

// This middleware allows your server to read JSON sent in a request body
app.use(express.json());

const MONGO_URI = 'mongodb+srv://admin:secretpassword123@cluster0.5u8mdrl.mongodb.net/?appName=Cluster0'

mongoose.connect(MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch((error) => console.error('Database connection error:', error));
// This is the blueprint for our User data
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true }
});

// This creates the tool (Model) we will use to type instructions to the database
const User = mongoose.model('User', userSchema);

// ROUTE: Create a new user (POST method)
app.post('/api/users', async (req, res) => {
    try {
        // 1. Take the data sent by the user from the request body
        const newUser = new User(req.body);
        
        // 2. Save it to MongoDB
        await newUser.save();
        
        // 3. Send back a success status code (201) and the saved user data
        res.status(201).json(newUser);
    } catch (error) {
        // 4. If something goes wrong (e.g. missing required field), send a 400 error
        res.status(400).json({ message: error.message });
    }
});


// A basic test route to ensure your server works
app.get('/', (req, res) => {
    res.send('Your API is up and running!');
});

// ROUTE 1: Get ALL users from the database
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find(); // .find() gets everything in the collection
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ROUTE 2: Get a SINGLE user by their specific ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id); // Looks for the ID passed in the URL
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE: Change a user's details by ID
app.patch('/api/users/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE: Remove a user by ID
app.delete('/api/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});