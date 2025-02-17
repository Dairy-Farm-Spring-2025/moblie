import React from 'react';
import { Dimensions, ScrollView } from 'react-native';
import RenderHTML from 'react-native-render-html';

interface RenderQuillHTMLProps {
  htmlContent: string;
}

const RenderHtmlComponent = ({ htmlContent }: RenderQuillHTMLProps) => {
  const screenWidth = Dimensions.get('window').width;

  return (
    <ScrollView style={{ flex: 1 }}>
      <RenderHTML
        contentWidth={screenWidth}
        source={{ html: htmlContent }}
        tagsStyles={{
          h1: {
            fontSize: 24,
            fontWeight: 'bold',
            marginVertical: 4,
          },
          h2: { fontSize: 22, fontWeight: 'bold', marginVertical: 4 },
          h3: { fontSize: 20, fontWeight: 'bold', marginVertical: 4 },
          p: { fontSize: 16, lineHeight: 20, marginVertical: 4 },
          ul: { marginVertical: 4, paddingLeft: 16 },
          ol: { marginVertical: 4, paddingLeft: 16 },
          li: { fontSize: 16, lineHeight: 24, marginVertical: 2 },
          b: { fontWeight: 'bold' },
          i: { fontStyle: 'italic' },
          u: { textDecorationLine: 'underline' },
          blockquote: {
            fontStyle: 'italic',
            borderLeftWidth: 4,
            borderLeftColor: '#ccc',
            paddingLeft: 10,
            marginVertical: 8,
          },
        }}
        classesStyles={{
          // Handles React Quill classes for alignment
          'ql-align-center': { textAlign: 'center' },
          'ql-align-right': { textAlign: 'right' },
          'ql-align-justify': { textAlign: 'justify' },
        }}
        systemFonts={['Roboto', 'Arial']}
        baseStyle={{
          fontFamily: 'Roboto',
          color: '#000', // Default text color
          fontSize: 16,
        }}
      />
    </ScrollView>
  );
};

export default RenderHtmlComponent;
