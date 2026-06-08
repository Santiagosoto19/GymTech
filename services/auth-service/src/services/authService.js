const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

class AuthService {
  async register(data) {
    const { email, password } = data;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Aquí iría la lógica para guardar en la base de datos
    const user = {
      id: 'user-' + Date.now(),
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    return { user: { id: user.id, email: user.email } };
  }

  async login(data) {
    const { email, password } = data;

    // Aquí iría la lógica para buscar el usuario en la base de datos
    const mockUser = {
      id: 'user-123',
      email,
      password: await bcrypt.hash('password123', 10),
    };

    const isValid = await bcrypt.compare(password, mockUser.password);
    if (!isValid) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const token = jwt.sign(
      { userId: mockUser.id, email: mockUser.email },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    return { token, user: { id: mockUser.id, email: mockUser.email } };
  }

  async getProfile(userId) {
    // Aquí iría la lógica para obtener el usuario de la base de datos
    return { id: userId, email: 'user@example.com', name: 'John Doe' };
  }
}

module.exports = new AuthService();
