import express from 'express';
import request from 'supertest';
import cafeRoutes from '../routes/cafeRoutes';
import cafeController from '../controllers/cafeController';

jest.mock('../controllers/cafeController');

const app = express();
app.use('/cafe', cafeRoutes);

describe('Cafe Routes Test', () => {
    it('GET /cafe should fetch all cafes', async () => {
        cafeController.getCafes.mockImplementation((req, res) => {
            res.json({ matches: [{ title: 'Cafe 1' }] });
        });

        const response = await request(app).get('/cafe');
        expect(response.status).toBe(200);
        expect(response.body.matches).toHaveLength(1);
        expect(response.body.matches[0].title).toBe('Cafe 1');
    });
});
