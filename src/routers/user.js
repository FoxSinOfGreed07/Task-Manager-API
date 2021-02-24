const User = require('../models/user');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const email = require('../emails/account');

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const upload = new multer({
    limits : {
        fileSize : 10**6
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error("File must be a JPG/ JPEG/ PNG file"));
        } else {
            cb(undefined, true);
        }

    }
})
const router = new express.Router();

router.post('/users', async (req, res) =>{
    const user = new User(req.body);

    try {
        const token = await user.generateAuthToken();
        await user.save();
        await email.sendWelcomeMail(user.email, user.name);
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token});
    } catch (error) {
        res.status(400).send({Error : 'Incorrect Pass or Email'});
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !==req.token;
        })
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send(error);
    }
})

router.post('/users/logoutAll', auth, async (req, res) =>{
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send(error);
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})

router.patch('/users/me', auth , async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'email', 'password'];
    const isAllowed = updates.every((update) => allowedUpdates.includes(update));

    if(!isAllowed){
        return res.status(400).send({error : 'Invalid Update!'});
    }
    try {
        const user = req.user;
        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();        
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        await email.sendGoodbyeMail(req.user.email, req.user.name)
        res.send('Deleted!');
    } catch (error) {
        res.status(500).send(error);
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width : 250, height : 280}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send( {Error : error.message} );
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send();
    } catch(error) {
        res.status(500).send(error);
    }
})

router.get('/users/:id/avatar', async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar) {
            throw new Error();
        }
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (error) {
        res.status(400).send();
    }
})

module.exports = router;