import { expect } from 'chai';
import MockDate  from 'mockdate';
import { verify } from 'jsonwebtoken';
import { createGovAuNotifyToken } from '../src/authentication';

describe('Authentication', function() {

  beforeEach(function() {
    MockDate.set(1234567890000);
  });

  afterEach(function() {
    MockDate.reset();
  });

  describe('tokens', function() {

    it('can be generated and decoded', function() {

      const token = createGovAuNotifyToken("SECRET", '123');
      const decoded : any = verify(token, 'SECRET');

      expect(token).to.equal('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIxMjMiLCJpYXQiOjEyMzQ1Njc4OTB9.p1-3R-8pndBgV_s-QOxTqvPua72gET8qF_uQ2GH4XoQ');
      expect(decoded.iss).to.equal('123');
      expect(decoded.iat).to.equal(1234567890);

    });

  });

});
