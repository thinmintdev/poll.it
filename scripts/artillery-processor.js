const { v4: uuidv4 } = require('uuid');

// Custom functions for Artillery
module.exports = {
  // Generate random string
  randomString: function(context, events, done) {
    const adjectives = ['awesome', 'incredible', 'amazing', 'fantastic', 'excellent', 'outstanding', 'remarkable', 'wonderful'];
    const nouns = ['poll', 'survey', 'question', 'choice', 'option', 'decision', 'vote', 'selection'];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    
    context.vars.randomString = `${adjective}-${noun}-${number}`;
    return done();
  },

  // Generate random boolean
  randomBoolean: function(context, events, done) {
    context.vars.randomBoolean = Math.random() < 0.5;
    return done();
  },

  // Generate random integer between min and max
  randomInt: function(min, max) {
    return function(context, events, done) {
      context.vars.randomInt = Math.floor(Math.random() * (max - min + 1)) + min;
      return done();
    };
  },

  // Generate UUID
  uuid: function(context, events, done) {
    context.vars.uuid = uuidv4();
    return done();
  },

  // Generate realistic voter IP
  randomIP: function(context, events, done) {
    const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    context.vars.randomIP = ip;
    return done();
  },

  // Log custom metrics
  logMetrics: function(context, events, done) {
    console.log(`User ${context.vars.$uuid} completed scenario`);
    return done();
  }
};
