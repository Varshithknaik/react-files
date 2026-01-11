export const userAuth = (req, res, next) => {
  const token = req.headers.authorization

  if (!token) {
    res.status(401).json({
      message: 'Unauthorized',
    })
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  if (!decoded) {
    res.status(401).json({
      message: 'Unauthorized',
    })
  }

  req.user = decoded

  next()
}
