import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('famhold_db', 'postgres', 'mamberto16', {
  host: '127.0.0.1',
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});

try {
  await sequelize.authenticate();
  console.log('Database connected successfully with Sequelize');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

export default sequelize;
