import express from 'express';
import url from 'url';
import { isValidObjectId } from 'mongoose';
import { UserEssay } from './util/schema.js';

const router = express.Router();

router.patch('/:id', async (req, res) => {
    await UserEssay.updateOne({ _id: req.params.id }, { $set: { googleId: req.body.docId } });
});

router.get('/:id', async (req, res) => {
    res.send({ googleId: (await UserEssay.findById(req.params.id)).googleId });
});

router.delete('/del/:id', async(req, res) => {
    if(isValidObjectId(req.params.id)) {
        await UserEssay.findByIdAndDelete(req.params.id);
        res.sendStatus(200);
    } else
        res.sendStatus(502);
});

router.post('/comments/:id', async (req, res) => {
    if (isValidObjectId(req.params.id)) {
        await UserEssay.updateOne({ _id: req.params.id }, { $set: { comments: req.body.comments } });
        res.redirect(url.format({
            pathname:`/teacher/view/${req.params.id}`
        }));
    } else {
        res.sendStatus(502);
    }
});

export default router;