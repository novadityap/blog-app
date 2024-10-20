import authService from '../services/authService.js';

export const signup = async (req, res, next) => {
  try {
    await authService.signup(req.body);

    res.json({
      code: 200,
      message: 'Please check your email to verify your account',
    });
  } catch (e) {
    next(e);
  }
};

export const emailVerification = async (req, res, next) => {
  try {
    await authService.emailVerification(req.params.token);

    res.json({
      code: 200,
      message: 'Email has been verified, you can now login',
    });
  } catch (e) {
    next(e);
  }
};

export const resendEmailVerification = async (req, res, next) => {
  try {
    await authService.resendEmailVerification(req.body);

    res.json({
      code: 200,
      message: 'Please check your email to verify your account',
    });
  } catch (e) {
    next(e);
  }
};

export const signin = async (req, res, next) => {
  try {
    const { token, refreshToken, user, permissions, roles } =
      await authService.signin(req.body);

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        code: 200,
        message: 'User logged in successfully',
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatarUrl,
          roles,
          permissions,
          token,
        },
      });
  } catch (e) {
    next(e);
  }
};

export const signout = async (req, res, next) => {
  try {
    await authService.signout(req.cookies.refreshToken);

    res.clearCookie('refreshToken');
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const newToken = await authService.refreshToken(req.cookies.refreshToken);
    
    res.json({
      code: 200,
      message: 'Token refreshed successfully',
      data: { token: newToken },
    });
  } catch (e) {
    next(e);
  }
};

export const requestResetPassword = async (req, res, next) => {
  try {
    await authService.requestResetPassword(req.body);

    res.json({
      code: 200,
      message: 'Please check your email to reset your password',
    });
  } catch (e) {
    next(e);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body, req.params.token);
   
    res.json({
      code: 200,
      message:
        'Password has been reset successfully, please login with your new password',
    });
  } catch (e) {
    next(e);
  }
};
