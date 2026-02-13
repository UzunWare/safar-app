const React = require('react');
const { View } = require('react-native');

const createMockIcon = (name) => {
  const MockIcon = (props) => React.createElement(View, { ...props, testID: `icon-${name}` });
  MockIcon.displayName = name;
  return MockIcon;
};

module.exports = new Proxy(
  {},
  {
    get: (_target, prop) => {
      if (typeof prop === 'string' && prop !== '__esModule') {
        return createMockIcon(prop);
      }
      return undefined;
    },
  }
);
