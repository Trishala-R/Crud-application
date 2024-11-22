require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const port = 500;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'views')));

mongoose.connect('mongodb://localhost:27017/crud_db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("Failed to connect to MongoDB", error));

const userSchema = new mongoose.Schema({
    
    username:String, 
    email: String,
     password: String,
    isDeleted: { type: Boolean, default: false } // Soft delete flag
});

const User = mongoose.model('User', userSchema);


app.post('/save', async (req, res) => {
    const {username , email , password } = req.body;
    const user = new User({ username , email , password });
    await user.save();
    console.log("User saved with name:", username);
    res.redirect('/?message=You have signed in');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'crud.html'));
});

app.get('/create', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'create.html'));
});

app.get('/users', async ( req, res) => {
    try {
        const user = await User.find({ isDeleted: false }); 
        res.json(user);
    } catch (error) {
        console.error('Failed to fetch users', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});


app.get('/update', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'update.html'));
});

app.post('/update', async (req, res) => {
    const { username, newusername, email, password } = req.body;
    try {
        const user = await User.findOne({ username: username }); // Find the user by current username

        if (user) {
            user.username = newusername;
            user.email = email;
            user.password = password;
            await user.save(); 

            console.log(`User with username ${username} updated to new details`);
            res.redirect('/?message=User updated successfully');
        } else {
            console.log(`No user found with username ${username}`);
            res.redirect('/?message=No user found with that username');
        }
    } catch (error) {
        console.error('Failed to update user', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.get('/delete', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'delete.html'));
});

app.post('/delete', async (req, res) => {
    const { username } = req.body; 
    try {
        const user = await User.findOneAndUpdate(
            { username: username },
            { isDeleted: true }
        );

        if (user) {
            console.log(`User with username ${username} marked as deleted`);
            res.redirect('/?message=User deleted successfully');
        } else {
            console.log(`No user found with username ${username}`);
            res.redirect('/?message=No user found with that username');
        }
    } catch (error) {
        console.error('Failed to delete user', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
