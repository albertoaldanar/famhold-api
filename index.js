import 'dotenv/config'
import express from 'express';
import sequelize from './database/database.js';
import userRoutes from './routes/userRoutes.js';
import familyRoutes from './routes/familyRoutes.js';
import accountManagerRoutes from './routes/accountManagerRoutes.js';
import famholdAdminRoutes from './routes/famholdAdminRoutes.js';
import familymemberRoutes from './routes/familyMemberRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import vfoRoutes from './routes/vfoRoutes.js';
import authRoutes from './routes/authRoutes.js';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
  try {
    await sequelize.sync();
  console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Error syncing models:', error);
  }
})();

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/accountManagers', accountManagerRoutes);
app.use('/api/famholdAdmins', famholdAdminRoutes);
app.use('/api/familyMember', familymemberRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/vfo', vfoRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
