module.exports = {
  name: 'plugins-stream-client',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/plugins/stream-client',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js',
  ],
  // todo: switch for setupFilesAfterEnv after https://github.com/nrwl/nx/issues/1343 is fixed
  setupTestFrameworkScriptFile: './src/test.setup.ts',
};
