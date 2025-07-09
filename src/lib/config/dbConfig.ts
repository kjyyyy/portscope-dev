const dbConfig = {
  uri: process.env.MONGODB_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
};

export default dbConfig;