// Libs
const request = require('supertest');
const sinon = require('sinon')
const { expect } = require('chai');

// App
const app = require('../../app');

// Mock
const contactService = require('../../service/contactService');
const fakeContact = {
                name: 'matheus',
                phone: '3200000000'
            }

describe('Contact Tests', ()=>{
    describe('POST /notes', ()=>{
        it('Try to create a empty contact', async ()=>{
            const response = await request(app).post('/contacts').send({});
            expect(response.statusCode).to.equal(400)
            expect(response.body).to.have.property('error', 'Nome e telefone são obrigatórios.')
        })
        it('Try to create a contact without phone', async ()=>{
            const response = await request(app).post('/contacts').send({name: fakeContact.name});
            expect(response.statusCode).to.equal(400)
            expect(response.body).to.have.property('error', 'Nome e telefone são obrigatórios.')
        })
        it('Create a new note', async ()=>{
            const response = await request(app).post('/contacts').send(fakeContact);
            expect(response.statusCode).to.equal(201)
            expect(response.body).to.have.property('name', fakeContact.name)
            expect(response.body).to.have.property('phone', fakeContact.phone)
        })
    })
    describe('GET /contacts', ()=>{
        it('List for all contacts', async ()=>{
            const response = await request(app).get('/contacts');
            expect(response.statusCode).to.equal(200)
        })
    })
    describe('DELETE /contacts', ()=>{
        it('Delete an contact', async ()=>{
            const response = await request(app).delete('/contacts').send({"name":fakeContact.name});
            console.log(JSON.stringify(response))
            expect(response.statusCode).to.equal(204)
        })
    })
})