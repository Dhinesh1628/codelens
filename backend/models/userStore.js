const users = []
const reviews = []

export const findUserByEmail = (email) => users.find(u => u.email === email)
export const findUserById = (id) => users.find(u => u.id === id)
export const createUser = (user) => { users.push(user); return user }

export const saveReview = (userId, review) => {
  reviews.push({ userId, ...review, createdAt: new Date().toISOString() })
}

export const getUserReviews = (userId) =>
  reviews.filter(r => r.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))