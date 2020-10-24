'use strict'
const nacl = require('libsodium-wrappers')
const PasswordHashVerifier = require('../src/PasswordHashVerifier.js')

describe('PasswordHashVerifier', () => {

    let pw, hashedPw, verifier

    beforeAll(async () => {
      await nacl.ready
      verifier = await PasswordHashVerifier()
    })

    beforeEach(() => {
        const opslimit = nacl.crypto_pwhash_OPSLIMIT_MIN //min number of computations to perform
        const memlimit = nacl.crypto_pwhash_MEMLIMIT_MIN //min number of RAM that the function will use
        pw = nacl.randombytes_buf(16) //generate random pw
        hashedPw = nacl.crypto_pwhash_str(pw, opslimit, memlimit) // hash password
    })

    it('verifies a correct password', async() => {
        expect(verifier.verify(hashedPw, pw)).toBeTruthy()
    })

    it('rejects an incorrect password', async() => {
        expect(verifier.verify(hashedPw, nacl.randombytes_buf(16))).toBeFalsy()
    })
})
