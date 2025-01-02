const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

jest.mock('../models/User');

describe('PUT /users/update/:token', () => {
  it('devrait mettre à jour username utilisateur', async () => {
    const mockUser = {
      _id: '12345',
      username: 'Testeur',
      email: 'Testeur@test.com',
      token: 'testToken',
      save: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockResolvedValue(mockUser);

    const response = await request(app)
    .put("/users/update/testToken")
    .send({ username: "SuperTesteur" });

    expect(response.body.result).toBe(true);
    expect(response.body.message).toBe('Profil mis à jour avec succès !');
  });
});