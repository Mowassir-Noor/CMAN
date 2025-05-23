import { View, type ViewProps } from 'react-native';

import useThemeColor  from 'app/src/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
