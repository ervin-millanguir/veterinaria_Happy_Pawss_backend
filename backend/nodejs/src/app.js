const express = require('express');
const cors = require('cors');
const app = express();
const permitidos = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
  .split(',').map(s=>s.trim()).filter(Boolean);
app.use(cors({ origin(origin, cb) { if (!origin || permitidos.includes(origin)) return cb(null,true); cb(new Error('Origen CORS no permitido')); } }));
app.use(express.json({ limit: '32kb' }));
app.get('/api/health', (_req,res)=>res.json({status:'ok',servicio:'happy-paws'}));
app.use('/api/saludo', require('./routes/saludo.routes'));
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/servicios', require('./routes/servicios.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/usuarios', require('./routes/usuarios.routes'));
const {swaggerUi,esquema}=require('./config/swagger');
app.get('/api/docs.json', (_req,res)=>res.json(esquema));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(esquema));
app.use((err,_req,res,_next)=>{
  if (err.message==='Origen CORS no permitido') return res.status(403).json({mensaje:'Origen no autorizado'});
  console.error('Error del servidor:',err.message);
  res.status(500).json({mensaje:'Error interno'});
});
module.exports = app;
