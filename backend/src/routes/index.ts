import express from 'express';
import * as authController from '../controllers/authController.js';
import * as carController from '../controllers/carController.js';
import * as aiController from '../controllers/aiController.js';
import * as favoriteController from '../controllers/favoriteController.js';
import * as comparisonController from '../controllers/comparisonController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

// ── Auth ──────────────────────────────────────────────────────────
router.post('/auth/register', validate(schemas.register), authController.register);
router.post('/auth/login',    validate(schemas.login),    authController.login);
router.post('/auth/google',   authController.googleAuth);

// ── Cars — static routes BEFORE :id ──────────────────────────────
router.get('/cars/makes',        carController.getMakes);
router.get('/cars/classes',      carController.getClasses);
router.get('/cars/stats',        carController.getStats);
router.get('/cars/seed',         carController.seedCars);
router.get('/cars/seed/status',  carController.seedStatus);
router.post('/cars/fetch',       authenticateToken, carController.fetchAndCache);

router.get('/cars',     optionalAuth, carController.getAllCars);
router.get('/cars/:id', carController.getCarById);
router.post('/cars',    authenticateToken, carController.createCar);
router.put('/cars/:id', authenticateToken, carController.updateCar);
router.delete('/cars/:id', authenticateToken, carController.deleteCar);

// ── AI ────────────────────────────────────────────────────────────
router.post('/ai/search', validate(schemas.aiSearch), aiController.aiSearch);

// ── Favorites ─────────────────────────────────────────────────────
router.get('/favorites',           authenticateToken, favoriteController.getFavorites);
router.post('/favorites/:carId',   authenticateToken, favoriteController.addFavorite);
router.delete('/favorites/:carId', authenticateToken, favoriteController.removeFavorite);

// ── Comparisons ───────────────────────────────────────────────────
router.get('/comparisons',                    authenticateToken, comparisonController.getComparisonLists);
router.post('/comparisons',                   authenticateToken, comparisonController.createComparisonList);
router.post('/comparisons/:id/cars/:carId',   authenticateToken, comparisonController.addCarToComparison);
router.delete('/comparisons/:id/cars/:carId', authenticateToken, comparisonController.removeCarFromComparison);
router.delete('/comparisons/:id',             authenticateToken, comparisonController.deleteComparisonList);

export default router;
