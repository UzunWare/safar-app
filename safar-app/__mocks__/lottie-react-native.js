const React = require('react');
const { View } = require('react-native');

const LottieView = React.forwardRef(function LottieView(props, ref) {
  return React.createElement(View, {
    testID: props.testID || 'lottie-view',
    ref,
    ...props,
  });
});

module.exports = {
  __esModule: true,
  default: LottieView,
};
