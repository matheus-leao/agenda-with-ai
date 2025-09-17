const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');

describe('Auth Tests', ()=>{
  const user = { name: 'authuser', password: 'mypassword' };

  it('Register a new user', async ()=>{
    const res = await request(app).post('/register').send(user);
    expect(res.statusCode).to.equal(201);
    expect(res.body).to.have.property('name', user.name);
  });

  it('Login with valid credentials', async ()=>{
    const res = await request(app).post('/login').send(user);
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('token');
  });

  it('Login with invalid credentials', async ()=>{
    const res = await request(app).post('/login').send({ name: user.name, password: 'wrong' });
    expect(res.statusCode).to.equal(401);
    expect(res.body).to.have.property('error');
  });
});
