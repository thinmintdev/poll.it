module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.ts',
      'src/**/*.tsx',
      'src/**/*.js',
      'src/**/*.jsx',
      '!src/**/*.test.ts',
      '!src/**/*.test.tsx',
      '!src/**/*.spec.ts',
      '!src/**/*.spec.tsx',
      'jest.config.js',
      'jest.setup.js',
      'package.json',
      'tsconfig.json',
      '.env.local',
      '.env'
    ],

    tests: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx'
    ],

    env: {
      type: 'node',
      runner: 'node'
    },

    testFramework: 'jest',

    compilers: {
      '**/*.ts?(x)': wallaby.compilers.typeScript({
        module: 'commonjs',
        target: 'es2018',
        jsx: 'react',
        experimentalDecorators: true,
        emitDecoratorMetadata: true
      })
    },

    setup: function (wallaby) {
      const jestConfig = require('./jest.config.js');
      
      // Merge wallaby-specific settings with jest config
      jestConfig.testEnvironment = 'jsdom';
      jestConfig.setupFilesAfterEnv = ['<rootDir>/jest.setup.js'];
      jestConfig.moduleNameMapper = jestConfig.moduleNameMapper || {};
      jestConfig.moduleNameMapper['^@/(.*)$'] = '<rootDir>/src/$1';
      
      wallaby.testFramework.configure(jestConfig);
    },

    hints: {
      ignoreCoverage: /ignore coverage/
    },

    // Performance optimizations
    workers: {
      initial: 2,
      regular: 1,
      recycle: false
    },

    // File change detection
    filesWithNoCoverageCalculated: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx'
    ],

    // Environment variables
    env: {
      params: {
        runner: '--experimental-modules'
      }
    },

    // Debug settings
    debug: false,
    
    // Report console logs
    reportConsoleErrorAsError: true,

    // Automatic test detection
    autoDetect: true,

    // Delays for better performance
    delays: {
      run: 300,
      edit: 100
    },

    // Integration with Next.js and modern tooling
    preprocessors: {
      '**/*.js?(x)': file => require('@babel/core').transform(
        file.content,
        {
          sourceMap: true,
          filename: file.path,
          presets: [
            ['next/babel']
          ]
        }
      )
    }
  };
};