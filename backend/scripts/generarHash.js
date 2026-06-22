import bcrypt from 'bcryptjs'

const hash = await bcrypt.hash('jose1702', 10)
console.log(hash)