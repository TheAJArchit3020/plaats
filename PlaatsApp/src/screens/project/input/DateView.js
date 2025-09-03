import React, {useState} from 'react';
import {TextInput, TouchableOpacity, View} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {epochToDateString} from '../../../utils';

const DateView = ({modelItem, projectObj, changesObj}) => {
  const [dateValue, setDateValue] = useState(new Date());
  const [value, setValue] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    hideDatePicker();
    setDateValue(date);
    setValue(date.getTime() / 1000);
    projectObj[modelItem.name] = date.getTime() / 1000;
    changesObj[modelItem.name] = date.getTime() / 1000;
  };
  return (
    <View style={[{width: '80%'}]}>
      <TouchableOpacity
        onPress={() => {
          showDatePicker();
        }}>
        <View pointerEvents={'none'}>
          <TextInput
            placeholder={'Datum'}
            placeholderTextColor={'lightgrey'}
            multiline={true}
            style={{
              width: '100%',
              borderBottomWidth: 1,
              borderBottomColor: '#C7C1CB',
              paddingTop: 0,
              paddingBottom: 8,
              fontSize: 17,
            }}
            value={
              projectObj[modelItem.name]
                ? epochToDateString(projectObj[modelItem.name])
                : epochToDateString(value)
            }
          />
        </View>
      </TouchableOpacity>

      <DateTimePickerModal
        date={dateValue}
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

export default DateView;
