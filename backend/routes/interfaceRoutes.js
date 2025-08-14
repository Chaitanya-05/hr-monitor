import express from 'express';
import {
  getInterfaceLogs,
  getSummaryMetrics,
  createInterfaceLog,
  updateInterfaceLog,
  getInterfaceLogById,
  deleteInterfaceLog,
  seedSampleData
} from '../controllers/interfaceController.js';

const router = express.Router();

router.get('/metrics', getSummaryMetrics);

router.get('/logs', getInterfaceLogs);

router.post('/logs', createInterfaceLog);
router.get('/logs/:id', getInterfaceLogById);
router.put('/logs/:id', updateInterfaceLog);
router.delete('/logs/:id', deleteInterfaceLog);

router.post('/seed', seedSampleData);

export default router;
