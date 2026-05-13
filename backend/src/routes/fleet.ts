// src/infra/http/routes/fleet.ts
import { Router } from 'express';
import { 
  makeListVehiclesController, 
  makeUpdateVehicleController 
} from '../main/factories/update-vehicle-factory';

const router = Router();

// Instanciamos os controllers via Factory
const listVehiclesController = makeListVehiclesController();
const updateVehicleController = makeUpdateVehicleController();

// GET /api/vehicles
router.get('/vehicles', async (req, res) => {
  const vehicles = await listVehiclesController.handle();
  res.json(vehicles);
});

// POST /api/vehicles (Agora usando Clean Architecture!)
// No src/infra/http/routes/fleet.ts

router.post('/vehicles', async (req, res) => {
  try {
    await updateVehicleController.handle(req.body);
    
    // Se chegar aqui, deu tudo certo
    res.status(201).json({ message: "Localização atualizada com sucesso" });
  } catch (error: any) {
    // Agora o erro lançado pelo Use Case cai aqui!
    res.status(400).json({ 
      error: "Erro de validação",
      details: error.message 
    });
  }
});

export default router;