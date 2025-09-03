import React, {useEffect, useRef, useState} from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  TextInput,
  View,
  LogBox,
  StyleSheet,
  InteractionManager,
} from 'react-native';
import OptionModal from '../../../components/modals/OptionModal';
import AsyncStore from '../../../services/storage/AsyncStore';

const SuggestionInput = ({modelItem, projectObj, changesObj}) => {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const input = useRef(null);

  useEffect(() => {
    if (projectObj && projectObj[modelItem.name]) {
      setValue(projectObj[modelItem.name]);
    } else {
      setValue('');
    }
  }, [projectObj, modelItem]);

  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
  }, []);

  useEffect(() => {
    if (modelItem.type === 'color') {
      AsyncStore.getColors().then((colors) => {
        modelItem.options = colors;
      });
    }
  }, [projectObj, modelItem]);

  const updateValue = (val) => {
    setValue(val);
    projectObj[modelItem.name] = val;
    changesObj[modelItem.name] = val;
  };

  const onClickSuggestion = (item) => {
    updateValue(item);
    setShowSuggestions(false);
    input.current.blur();
  };

  const onBlur = () => {
    setShowSuggestions(false);
  };

  const onClickInput = () => {
    if (['select', 'suggestion', 'color'].includes(modelItem.type)) {
      if (showSuggestions) {
        setShowSuggestions(false);
        triggerInput();
      } else {
        setShowSuggestions(true);
      }
    } else {
      triggerInput();
    }
  };

  const triggerInput = () => {
    InteractionManager.runAfterInteractions(() => {
      input.current.blur();
      input.current.focus();
    });
  };

  const makeSuggestions = () => {
    let suggestions = [];
    for (let option of modelItem.options) {
      suggestions.push({
        name: option,
        press: () => onClickSuggestion(option),
      });
    }
    suggestions.push({
      name: 'Andere',
      press: () => {
        setShowSuggestions(false);
        triggerInput();
      },
    });
    return suggestions;
  };

  return (
    <View style={{width: '80%', flex: 1}}>
      <TouchableOpacity onPress={onClickInput}>
        <View pointerEvents="none">
          <TextInput
            placeholder={modelItem.name}
            placeholderTextColor={'lightgrey'}
            ref={input}
            multiline={true}
            style={{
              width: '100%',
              color: '#4B5258',
              borderBottomWidth: 1,
              borderBottomColor: '#C7C1CB',
              fontSize: 17,
              paddingTop: 0,
              paddingBottom: 8,
            }}
            value={value}
            onChangeText={(data) => {
              setValue(data);
              projectObj[modelItem.name] = data;
              changesObj[modelItem.name] = data;
            }}
            onBlur={onBlur}
            blurOnSubmit={modelItem.type !== 'textarea'}
            keyboardType={modelItem.type === 'number' ? 'numeric' : 'default'}
          />
        </View>
      </TouchableOpacity>
      {modelItem.options && (
        <OptionModal
          modalVisible={showSuggestions}
          setModalVisible={setShowSuggestions}
          content={makeSuggestions()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  suggestionElementView: {
    fontSize: 18,
    paddingTop: 14,
    paddingBottom: 14,
    width: '100%',
    paddingHorizontal: 30,
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalView: {
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
});

export default SuggestionInput;
