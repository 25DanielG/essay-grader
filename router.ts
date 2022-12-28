import express from 'express';
import { UserEssay } from './app.js';

const router = express.Router();

router.patch('/:id', async (req, res) => {
    await UserEssay.updateOne({ _id: req.params.id }, { $set: { googleId: req.body.docId } });
});

router.get('/:id', async (req, res) => {
    res.send({ googleId: (await UserEssay.findById(req.params.id)).googleId });
});

export default router;