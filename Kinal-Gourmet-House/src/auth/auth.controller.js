import User from '../users/user.model.js';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {

  try {
    const { email, password } = req.body;

    // se busca el usuario
    const user = await User.findOne({ email, isActive: true });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // compara la password
    const validPassword = await user.comparePassword(password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // se crea el token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error en login',
      error: err.message
    });
  }
};
