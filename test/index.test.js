'use strict';

var Analytics = require('@segment/analytics.js-core').constructor;
var Aptrinsic = require('../lib');
var integration = require('@segment/analytics.js-integration');
var sandbox = require('@segment/clear-env');
var tester = require('@segment/analytics.js-integration-tester');

describe('Aptrinsic', function() {
  var analytics;
  var aptrinsic;
  var options = {
    apiKey: 'integration-test-key'
  };

  beforeEach(function() {
    analytics = new Analytics();
    aptrinsic = new Aptrinsic(options);

    analytics.use(Aptrinsic);
    analytics.use(tester);
    analytics.add(aptrinsic);
    analytics.user();
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    aptrinsic.reset();
    analytics.user().reset();
    analytics.group().reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(
      Aptrinsic,
      integration('Aptrinsic')
        .global('aptrinsic')
        .option('apiKey', '')
    );
  });

  describe('before loading', function() {
    describe('#initialize', function() {
      afterEach(function() {
        aptrinsic.reset();
      });
      it('should create window.aptrinsic', function() {
        analytics.initialize();
        analytics.assert(aptrinsic.loaded());
      });
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      // override the agent loaded message
      analytics.once('ready', function() {
        done();
      });
      analytics.initialize();
    });

    it('Integration should be loaded', function() {
      analytics.assert(aptrinsic.loaded());
    });

    describe('#identify', function() {
      beforeEach(function() {
        analytics.spy(window, 'aptrinsic');
      });

      it('should identify anonymous user', function() {
        analytics.identify();
        analytics.called(window.aptrinsic, 'identify');
      });

      it('should identify with the given id', function() {
        analytics.identify('id');
        analytics.called(window.aptrinsic,'identify');
      });

      it('should send the given id and gender', function() {
        analytics.identify('id', { gender: 'FEMALE' });
        analytics.called(window.aptrinsic,'identify');
      });

      it('should identify with the user data', function() {
        var userId = '1234';
        var userAttrs = {
          email: 'test@example.com',
          firstName: 'john',
          lastName: 'Doe',
          gender: 'MALE',
          phone: '(555) 555-5555',
          position: 'Mr.'
        };

        analytics.identify(userId, userAttrs);
        analytics.called(window.aptrinsic,'identify');
      });
      it('should identify with the address data', function() {
        var userId = '1234';
        var userAttrs = {
          email: 'test@example.com',
          firstName: 'john',
          lastName: 'Doe',
          gender: 'MALE',
          phone: '(555) 555-5555',
          position: 'Mr.',
          address: {
            street : '100 Main St.',
            countryCode : 'USA',
            stateCode : 'NY' ,
            city : 'New York City',
            zip : 10000
          }
        };

        analytics.identify(userId, userAttrs);
        analytics.called(window.aptrinsic,'identify');
      });

      it('should identify with the company data', function() {
        var userId = '1234';
        var userAttrs = {
          email: 'test@example.com',
          company: {
            name : 'Acme Corp',
            industry : 'Road Runner Catchers',
            employee_count : 10
          }
        };

        analytics.identify(userId, userAttrs);
        analytics.called(window.aptrinsic,'identify');
      });
    });


    describe('#group', function() {
      beforeEach(function(done) {
        analytics.once('ready', function() {
          done();
        });
        analytics.initialize();
      });

      it('should send an cust id', function() {
        analytics.spy(window, 'aptrinsic');
        analytics.group('custId');
        analytics.called(window.aptrinsic,'identify');
      });
    });

    describe('#track', function() {
      beforeEach(function(done) {
        analytics.once('ready', function() {
          done();
        });
        analytics.initialize();
      });

      it('should send a track event', function() {
        analytics.spy(window, 'aptrinsic');
        var eventName = 'Registered';
        var eventProperties = {
          plan: 'Pro Annual',
          accountType: 'Test'
        };
        analytics.track(eventName, eventProperties);
        analytics.called(window.aptrinsic,'event', eventName, eventProperties);
      });
    });
  });
});