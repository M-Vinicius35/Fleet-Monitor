import { Router } from 'express';

const router = Router();

// Mock de banco de dados (Para o MVP)
let vehicles = [
  { id: '1', plate: 'SAM-2026', model: 'Volvo FH', driver: 'Marcelo Silva', status: 'Em Rota' },
  { id: '2', plate: 'TEC-0099', model: 'Scania R450', driver: 'Ana Souza', status: 'Manutenção' }
];

router.get('/vehicles', (req, res) => {
  res.json(vehicles);
});

router.post('/vehicles', (req, res) => {
  const newVehicle = { id: Date.now().toString(), ...req.body };
  vehicles.push(newVehicle);
  res.status(201).json(newVehicle);
});

export default router;