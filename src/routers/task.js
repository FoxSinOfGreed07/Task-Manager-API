const Task = require('../models/task');
const auth = require('../middleware/auth');

const express = require('express');

const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        Creator : req.user._id
    });
    
    try {
        await task.save();
        res.status(201).send(task);   
    } catch (error) {
        res.status(400).send(error);
    }
})

router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};
    if(req.query.Completed){
        match.Completed = req.query.Completed === 'true';
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');  
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1;
    }
    try {
        await req.user.populate({
            path : 'tasks',
            match,
            options : {
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        const tasks = req.user.tasks;
        if(!tasks){
            res.status(404).send({error : 'No Tasks Found!'});
        }
        res.send(tasks);
    } catch (error) {
        res.status(500).send();
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({ _id, Creator : req.user._id });
        if(!task){
            return res.status(404).send({error : 'Task not found!'});
        }
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['Description', 'Completed'];
    const isAllowed = updates.every((update) => allowedUpdates.includes(update));

    if(!isAllowed){
        return res.status(400).send({error : 'Invalid Update!'});
    }
    try {
        const task = await Task.findOne({ _id, Creator : req.user._id });
        if(!task){
            return res.status(404).send({error : 'Task Not Found!'});
        }
        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOneAndDelete({ _id, Creator : req.user._id });
        if(!task){
            return res.status(404).send({error : 'Task not found!'});
        }
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
})

module.exports = router;