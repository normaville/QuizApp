import '@expo/metro-runtime';
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, createTheme, Button, ButtonGroup, Text } from '@rneui/themed';

const Stack = createNativeStackNavigator();
const theme = createTheme({});

// GitHub Pages Routing Configuration
const linking = {
  prefixes: [window.location.origin],
  config: {
    screens: {
      Question: 'question',
      Summary: 'summary',
    },
  },
};

/* 
Correct Answers for sample data:
1. "multiple-choice" -> Pure Vanilla Cookie (index 0)
2. "multiple-answer" -> Pure Vanilla and Hollyberry (index 0, 2)
3. "true-false"      -> True (index 0)
*/

export const Question = ({ route, navigation }) => {
  const { data, index, userResults = [] } = route.params;
  const current = data[index];
  const isMultiple = current.type === 'multiple-answer';

  const [singleIdx, setSingleIdx] = useState(null);
  const [multiIdxs, setMultiIdxs] = useState([]);

  const handleNext = () => {
    const selected = isMultiple ? multiIdxs : singleIdx;
    
    // Logic: Array comparison for multi-answer, strict value for others
    const isCorrect = Array.isArray(current.correct)
      ? JSON.stringify([...selected].sort()) === JSON.stringify([...current.correct].sort())
      : selected === current.correct;

    const updatedResults = [...userResults, { ...current, selected, isCorrect }];

    if (index + 1 < data.length) {
      navigation.push('Question', { data, index: index + 1, userResults: updatedResults });
    } else {
      navigation.navigate('Summary', { results: updatedResults });
    }
  };

  const hasSelection = isMultiple ? multiIdxs.length > 0 : singleIdx !== null;

  return (
    <View style={styles.container}>
      <Text h4 style={styles.prompt}>{current.prompt}</Text>
      <ButtonGroup
        testID="choices"
        buttons={current.choices}
        selectMultiple={isMultiple}
        selectedIndex={isMultiple ? undefined : singleIdx}
        selectedIndexes={isMultiple ? multiIdxs : []}
        onPress={(val) => isMultiple ? setMultiIdxs(val) : setSingleIdx(val)}
        vertical
        containerStyle={styles.buttonGroup}
      />
      <Button
        testID="next-question"
        title="Next Question"
        onPress={handleNext}
        disabled={!hasSelection}
        containerStyle={styles.nextBtn}
      />
    </View>
  );
};

export const Summary = ({ route }) => {
  const { results } = route.params;
  const score = results.filter(r => r.isCorrect).length;

  return (
    <ScrollView style={styles.container}>
      <Text testID="total" h3 style={styles.center}>Total Score: {score}</Text>
      {results.map((item, qIdx) => (
        <View key={qIdx} style={styles.summaryItem}>
          <Text style={styles.bold}>{item.prompt}</Text>
          {item.choices.map((choice, cIdx) => {
            const isCorrectAnswer = Array.isArray(item.correct) ? item.correct.includes(cIdx) : item.correct === cIdx;
            const isSelected = Array.isArray(item.selected) ? item.selected.includes(cIdx) : item.selected === cIdx;

            let textStyle = styles.choiceBase;
            if (isCorrectAnswer && isSelected) textStyle = [styles.choiceBase, styles.correctBold];
            else if (!isCorrectAnswer && isSelected) textStyle = [styles.choiceBase, styles.incorrectStrike];

            return <Text key={cIdx} style={textStyle}>• {choice}</Text>;
          })}
        </View>
      ))}
    </ScrollView>
  );
};

export default function App() {
  const quizData = [
    { 
      "prompt": "Which Ancient Cookie is the founder of the Vanilla Kingdom and was once known as Healer Cookie?", 
      "type": "multiple-choice", 
      "choices": ["Pure Vanilla Cookie", "White Lily Cookie", "Onion Cookie", "Shadow Milk Cookie"], 
      "correct": 0 
    },
    { 
      "prompt": "Which of the following Cookies are members of the Ancient Heroes who fought in the Dark Flour War? (Select all that apply)", 
      "type": "multiple-answer", 
      "choices": ["Pure Vanilla Cookie", "Sea Fairy Cookie", "Hollyberry Cookie", "Golden Cheese Cookie"], 
      "correct": [0, 2] 
    },
    { 
      "prompt": "White Lily Cookie and Dark Enchantress Cookie are actually the same person.", 
      "type": "true-false", 
      "choices": ["True", "False"], 
      "correct": 0 
    }
  ];

  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer linking={linking}>
        <Stack.Navigator initialRouteName="Question">
          <Stack.Screen name="Question" component={Question} initialParams={{ data: quizData, index: 0 }} />
          <Stack.Screen name="Summary" component={Summary} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  prompt: { marginBottom: 20, textAlign: 'center' },
  center: { textAlign: 'center', marginVertical: 20 },
  buttonGroup: { marginBottom: 20 },
  nextBtn: { borderRadius: 8 },
  summaryItem: { marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  bold: { fontWeight: 'bold', marginBottom: 5 },
  choiceBase: { color: '#444', fontSize: 14, marginVertical: 2 },
  correctBold: { fontWeight: 'bold', color: 'green' },
  incorrectStrike: { textDecorationLine: 'line-through', color: 'red' }
});
